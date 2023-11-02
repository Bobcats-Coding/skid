import { createApplication } from '../core/application'
import { createInternalServicesHook } from './internal-services-hook'

test('create a hook', () => {
  const applications = {
    key: () =>
      createApplication<Record<string, any>, Services>({
        getInternalServices: () => ({ service: 'service1' }),
      }),
  } as const
  const { useInternalServices } = createInternalServicesHook<Services, typeof applications>(
    applications,
  )
  const service = useInternalServices('key', 'service')
  expect(service).toBe('service1')
  const services = useInternalServices('key')
  expect(services).toEqual({ service: 'service1' })
})

test('get service from non-existing key', () => {
  const applications = {
    key: () =>
      createApplication<Record<string, any>, Services>({
        getInternalServices: () => ({ service: 'service1' }),
      }),
  } as const
  const { useInternalServices } = createInternalServicesHook<Services, typeof applications>(
    applications,
  )
  // @ts-expect-error key should be invalid
  expect(() => useInternalServices('key2', 'service')).toThrowError(
    'Internal services are not set for "key2"',
  )
})

test('load server InternalServices', () => {
  const applications = {
    key: () =>
      createApplication<Record<string, any>, Services>({
        getInternalServices: () => ({ service: 'service1' }),
      }),
  } as const
  const { useInternalServices, loadServerInternalServices } = createInternalServicesHook<
    Services,
    typeof applications
  >(applications)
  loadServerInternalServices('key', { service: 'service2' })
  const service = useInternalServices('key', 'service')
  expect(service).toBe('service2')
})

type Services = { service: string }
