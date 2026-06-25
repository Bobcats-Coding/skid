import { createApplication } from '../core/application'
import { createInternalServicesHook } from './internal-services-hook'

import { assert, type Equals } from 'tsafe'
import { expect, test } from 'vitest'

test('create a hook', () => {
  const application = createApplication<{ internalServices: Services; indentity: string }>({
    getInternalServices: [
      {
        pattern: 'key',
        value: () => ({ service: { name: 'service1' } }),
      },
    ],
  })
  const { loadInternalServices } = createInternalServicesHook(() => application)
  const service = loadInternalServices('key', 'service')
  assert<Equals<typeof service, Services['service']>>()
  expect(service.name).toBe('service1')
  const services = loadInternalServices('key')
  assert<Equals<typeof services, Services>>()
  expect(services).toEqual({ service: { name: 'service1' } })
})

test('get service from non-existing key', () => {
  const application = createApplication<{ internalServices: Services; identity: 'key' }>({
    getInternalServices: [
      {
        pattern: 'key',
        value: () => ({ service: { name: 'service1' } }),
      },
    ],
  })
  const { loadInternalServices } = createInternalServicesHook(() => application)
  // @ts-expect-error key should be invalid
  expect(() => loadInternalServices('key2', 'service')).toThrowError(
    'Internal services are not set for "key2"',
  )
})

test('load server InternalServices', () => {
  const application = createApplication<{ internalServices: Services; identity: 'key' }>({
    getInternalServices: [
      {
        pattern: 'key',
        value: () => ({ service: { name: 'service1' } }),
      },
    ],
  })
  const { loadInternalServices, setServerInternalServices } = createInternalServicesHook(
    () => application,
  )
  setServerInternalServices({ service: { name: 'service2' } })
  const services = loadInternalServices('key')
  expect(services.service.name).toBe('service2')
  const service = loadInternalServices('key', 'service')
  expect(service.name).toBe('service2')
})

test('should return with the same instance', () => {
  const application = createApplication<{ internalServices: Services; identity: 'key' }>({
    getInternalServices: [
      {
        pattern: 'key',
        value: () => ({ service: { name: 'service' } }),
      },
    ],
  })
  const { loadInternalServices } = createInternalServicesHook(() => application)
  const service = loadInternalServices('key', 'service')
  const service2 = loadInternalServices('key', 'service')
  expect(service).toBe(service2)
})

test('should return with the same instance if server and should not run app', () => {
  const application = createApplication<{ internalServices: Services; identity: 'key' }>({
    getInternalServices: [
      {
        pattern: 'key',
        value: () => ({ service: { name: 'service' } }),
      },
    ],
  })
  let runApp = false
  const { loadInternalServices, setServerInternalServices } = createInternalServicesHook(() => {
    runApp = true
    return application
  })
  setServerInternalServices({ service: { name: 'service2' } })
  const service = loadInternalServices('key', 'service')
  const service2 = loadInternalServices('key', 'service')
  expect(service).toBe(service2)
  expect(runApp).toBe(false)
})

test('export internal services state from backend', () => {
  const application = createApplication<{ internalServices: Services; identity: 'key' }>({
    exportState: () => 'state',
    getInternalServices: [
      {
        pattern: 'key',
        value: () => ({ service: { name: 'service' } }),
      },
    ],
  })
  const { exportInternalServicesState, setServerInternalServices } = createInternalServicesHook(
    () => application,
  )
  setServerInternalServices({ service: { name: 'service' } }, () => 'other-state')
  const state = exportInternalServicesState('key')
  expect(state).toBe('other-state')
})

test('export internal services state', () => {
  const application = createApplication<{ internalServices: Services; identity: 'key' }>({
    exportState: () => 'state',
    getInternalServices: [
      {
        pattern: 'key',
        value: () => ({ service: { name: 'service' } }),
      },
    ],
  })
  const { exportInternalServicesState } = createInternalServicesHook(() => application)
  const state = exportInternalServicesState('key')
  expect(state).toBe('state')
})

test('export internal services state', () => {
  let state
  const application = createApplication<{ internalServices: Services; identity: 'key' }>({
    importState: (_, s) => {
      state = s
    },
    getInternalServices: [
      {
        pattern: 'key',
        value: () => ({ service: { name: 'service' } }),
      },
    ],
  })
  const { importInternalServicesState } = createInternalServicesHook(() => application)
  importInternalServicesState('key', 'state')
  expect(state).toBe('state')
})

test('transform identity on app rerun', () => {
  let originalIdentity
  let newIdentity
  const application = createApplication<{
    internalServices: Services
    indentity: 'ssr' | 'frontend'
  }>({
    getInternalServices: [
      {
        pattern: 'frontend',
        value: () => ({ service: { name: 'frontend' } }),
      },
      {
        pattern: 'ssr',
        value: () => ({ service: { name: 'ssr' } }),
      },
    ],
    main: (_, i) => {
      newIdentity = i
    },
  })
  const { loadInternalServices } = createInternalServicesHook(
    () => application,
    (i) => {
      originalIdentity = i
      return 'frontend'
    },
  )
  loadInternalServices('ssr', 'service')
  expect(newIdentity).toBe('frontend')
  expect(originalIdentity).toBe('ssr')
})

type Services = { service: { name: string } }
