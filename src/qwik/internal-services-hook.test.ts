import { createApplication } from '../core/application'
import { createInternalServicesHook } from './internal-services-hook'

test('create a hook', () => {
  const applications = {
    key: () =>
      createApplication<Record<string, any>, Services>({
        getInternalServices: () => ({ service: { name: 'service1' } }),
      }),
  } as const
  const { useInternalServices } = createInternalServicesHook<Services, typeof applications>(
    applications,
  )
  const service = useInternalServices('key', 'service')
  expect(service.name).toBe('service1')
  const services = useInternalServices('key')
  expect(services).toEqual({ service: { name: 'service1' } })
})

test('get service from non-existing key', () => {
  const applications = {
    key: () =>
      createApplication<Record<string, any>, Services>({
        getInternalServices: () => ({ service: { name: 'service1' } }),
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
        getInternalServices: () => ({ service: { name: 'service1' } }),
      }),
  } as const
  const { useInternalServices, loadServerInternalServices } = createInternalServicesHook<
    Services,
    typeof applications
  >(applications)
  loadServerInternalServices('key', { service: { name: 'service2' } })
  const service = useInternalServices('key', 'service')
  expect(service.name).toBe('service2')
})

test('should return with the same instance', () => {
  const applications = {
    key: () =>
      createApplication<Record<string, any>, Services>({
        getInternalServices: () => ({ service: { name: 'service' } }),
      }),
  } as const
  const { useInternalServices } = createInternalServicesHook<Services, typeof applications>(
    applications,
  )
  const service = useInternalServices('key', 'service')
  const service2 = useInternalServices('key', 'service')
  expect(service).toBe(service2)
})

test('load server InternalServices', () => {
  const applications = {
    key: () =>
      createApplication<Record<string, any>, Services>({
        getInternalServices: () => ({ service: { name: 'service1' } }),
      }),
  } as const
  const { useInternalServices, loadServerInternalServices } = createInternalServicesHook<
    Services,
    typeof applications
  >(applications)
  loadServerInternalServices('key', { service: { name: 'service2' } })
  const service = useInternalServices('key', 'service')
  const service2 = useInternalServices('key', 'service')
  expect(service).toBe(service2)
})

type Services = { service: { name: string } }
