import { createApplication } from './application'

import { assert, type Equals } from 'tsafe'
import { expect, test } from 'vitest'

test('empty application', () => {
  const app = createApplication()
  const { externalServices, internalServices } = app.run()
  assert<Equals<typeof externalServices, Record<string, never>>>()
  assert<Equals<typeof internalServices, Record<string, never>>>()
  expect(externalServices).toEqual({})
  expect(internalServices).toEqual({})

  const app2 = createApplication({})
  const { externalServices: services2 } = app2.run()
  assert<Equals<typeof services2, Record<string, never>>>()
  expect(services2).toEqual({})
})

test('Get external services', () => {
  const myService = 'my-service'
  type Services = { myService: 'my-service' }
  const app = createApplication<{
    externalServices: Services
  }>({
    getExternalServices: () => ({ myService }),
  })
  const { externalServices } = app.run()
  assert<Equals<typeof externalServices, Services>>()
  expect(externalServices.myService).toBe('my-service')
})

test('Get external services by static identity', () => {
  type Services = { myService: string }
  const app = createApplication<{
    externalServices: Services
    identity: { type: 'type-1' | 'type-2' }
  }>({
    getExternalServices: [
      {
        pattern: { type: 'type-1' },
        value: () => ({ myService: 'my-service-1' }),
      },
      {
        pattern: { type: 'type-2' },
        value: () => ({ myService: 'my-service-2' }),
      },
    ],
  })
  const { externalServices: services1 } = app.run({ type: 'type-1' })
  assert<Equals<typeof services1, Services>>()
  expect(services1.myService).toBe('my-service-1')
  const { externalServices: services2 } = app.run({ type: 'type-2' })
  assert<Equals<typeof services2, Services>>()
  expect(services2.myService).toBe('my-service-2')
  // @ts-expect-error type-3 is not a key
  expect(() => app.run({ type: 'type-3' })).toThrow(
    'No matching identity for "getExternalServices"',
  )
})

test('Get external services by static partial identity', () => {
  type Services = { myService: string }
  const app = createApplication<{
    externalServices: Services
    identity: { type: 'type-1' | 'type-2'; data: number }
  }>({
    getExternalServices: [
      {
        patternPartial: { type: 'type-1' },
        value: () => ({ myService: 'my-service-1' }),
      },
      {
        patternPartial: { type: 'type-2' },
        value: () => ({ myService: 'my-service-2' }),
      },
    ],
  })
  const { externalServices: services1 } = app.run({ type: 'type-1', data: 1 })
  assert<Equals<typeof services1, Services>>()
  expect(services1.myService).toBe('my-service-1')
  const { externalServices: services2 } = app.run({ type: 'type-2', data: 2 })
  assert<Equals<typeof services2, Services>>()
  expect(services2.myService).toBe('my-service-2')
  // @ts-expect-error type-3 is not a key
  expect(() => app.run({ type: 'type-3' })).toThrow('No matching identity')
})

test('Register additional external services after creation', () => {
  type Services = { myService: string }
  const baseApp = createApplication<{
    externalServices: Services
    identity: { type: 'type-1' | 'type-2' | 'type-3'; data: number }
  }>({
    getExternalServices: () => ({ myService: 'my-service-default' }),
  })
  const app = createApplication(
    {
      getExternalServices: [
        {
          patternPartial: { type: 'type-1' },
          value: () => ({ myService: 'my-service-1' }),
        },
        {
          patternPartial: { type: 'type-2' },
          value: () => ({ myService: 'my-service-2' }),
        },
      ],
    },
    () => baseApp,
  )
  const { externalServices: services1 } = app.run({ type: 'type-1', data: 1 })
  assert<Equals<typeof services1, Services>>()
  expect(services1.myService).toBe('my-service-1')
  const { externalServices: services2 } = app.run({ type: 'type-2', data: 2 })
  assert<Equals<typeof services2, Services>>()
  expect(services2.myService).toBe('my-service-2')
  const { externalServices: services3 } = app.run({ type: 'type-3', data: 3 })
  assert<Equals<typeof services3, Services>>()
  expect(services3.myService).toBe('my-service-default')
})

test('The getExternalServices function should receive the run identity', () => {
  const myService = 'my-service'
  type Services = { myService: 'my-service' }
  let identity
  const app = createApplication<{
    externalServices: Services
    identity: string
  }>({
    getExternalServices: (identityExternalService) => {
      identity = identityExternalService
      return { myService }
    },
  })
  app.run('identity')
  expect(identity).toBe('identity')
})

test('Get internal services', () => {
  const myExternalService = 'my-service'
  type ExternalServices = { myExternalService: 'my-service' }
  type InternalServices = { myService: 'my-service' }
  const app = createApplication<{
    externalServices: ExternalServices
    internalServices: InternalServices
  }>({
    getExternalServices: () => {
      return { myExternalService }
    },
    getInternalServices: ({ myExternalService }) => {
      return {
        myService: myExternalService,
      }
    },
  })
  const { internalServices } = app.run()
  expect(internalServices.myService).toBe('my-service')
})

test('Register additional internal services after creation', () => {
  type Services = { myService: string }
  const baseApp = createApplication<{
    internalServices: Services
    identity: { type: 'type-1' | 'type-2' | 'type-3'; data: number }
  }>({
    getInternalServices: () => ({ myService: 'my-service-default' }),
  })
  const app = createApplication(
    {
      getInternalServices: [
        {
          patternPartial: { type: 'type-1' },
          value: () => ({ myService: 'my-service-1' }),
        },
        {
          patternPartial: { type: 'type-2' },
          value: () => ({ myService: 'my-service-2' }),
        },
      ],
    },
    () => baseApp,
  )
  const { internalServices: services1 } = app.run({ type: 'type-1', data: 1 })
  assert<Equals<typeof services1, Services>>()
  expect(services1.myService).toBe('my-service-1')
  const { internalServices: services2 } = app.run({ type: 'type-2', data: 2 })
  assert<Equals<typeof services2, Services>>()
  expect(services2.myService).toBe('my-service-2')
  const { internalServices: services3 } = app.run({ type: 'type-3', data: 3 })
  assert<Equals<typeof services3, Services>>()
  expect(services3.myService).toBe('my-service-default')
})

test('Register additional main after creation', () => {
  const baseApp = createApplication<{
    output: number
    identity: { type: 'type-1' | 'type-2' | 'type-3' }
  }>({
    main: () => 3,
  })
  const app = createApplication(
    {
      main: [
        {
          patternPartial: { type: 'type-1' },
          value: () => 1,
        },
        {
          patternPartial: { type: 'type-2' },
          value: () => 2,
        },
      ],
    },
    () => baseApp,
  )
  const { output: output1 } = app.run({ type: 'type-1' })
  expect(output1).toBe(1)
  const { output: output2 } = app.run({ type: 'type-2' })
  expect(output2).toBe(2)
  const { output: output3 } = app.run({ type: 'type-3' })
  expect(output3).toBe(3)
})

test('The getInternalServices function should receive the run identity', () => {
  const myService = 'my-service'
  type Services = { myService: 'my-service' }
  let identity
  const app = createApplication<{
    internalServices: Services
    identity: string
  }>({
    getInternalServices: (_, identityExternalService) => {
      identity = identityExternalService
      return { myService }
    },
  })
  app.run('identity')
  expect(identity).toBe('identity')
})

test('Pre-main can execute side-effects', () => {
  const myService = 'my-service'
  type Services = { myService: string }
  const app = createApplication<{
    internalServices: Services
  }>({
    getInternalServices: () => ({ myService }),
    preMain: (internalServices) => {
      internalServices.myService += '-side-effect'
    },
  })
  const { internalServices } = app.run()
  expect(internalServices.myService).toBe('my-service-side-effect')
})

test('The preMain function should receive the run identity', () => {
  let identity
  const app = createApplication<{
    identity: string
  }>({
    preMain: (_, identityExternalService) => {
      identity = identityExternalService
    },
  })
  app.run('identity')
  expect(identity).toBe('identity')
})

test('Get delivery', () => {
  const myService = 'my-service'
  type Services = { myService: 'my-service' }
  const app = createApplication<{
    internalServices: Services
    delivery: { AppComponent: () => JSX.Element }
  }>({
    getInternalServices: () => ({ myService }),
    getDelivery: ({ internalServices: { myService } }) => ({
      AppComponent: () => <span data-service={myService}></span>,
    }),
  })
  const { delivery } = app.run()
  expect(delivery.AppComponent().props['data-service']).toEqual('my-service')
})

test('The getDelivery function should receive the run identity', () => {
  let identity
  const app = createApplication<{
    identity: string
  }>({
    getDelivery: (_, identityExternalService) => {
      identity = identityExternalService
      return {}
    },
  })
  app.run('identity')
  expect(identity).toBe('identity')
})

test('main', () => {
  const myService = 'my-service'
  type Services = { myService: 'my-service' }
  const app = createApplication<{
    delivery: { AppComponent: () => JSX.Element }
    internalServices: Services
    output: string
  }>({
    getInternalServices: () => ({ myService }),
    getDelivery: ({ internalServices: { myService } }) => ({
      AppComponent: () => <span data-service={myService}></span>,
    }),
    main: ({ internalServices, delivery }) =>
      `${delivery.AppComponent().props['data-service']}-${internalServices.myService}`,
  })
  const { output } = app.run()
  expect(output).toEqual('my-service-my-service')
})

test('The main function should receive the run identity', () => {
  let identity
  const app = createApplication<{
    identity: string
  }>({
    main: (_, identityExternalService) => {
      identity = identityExternalService
      return undefined
    },
  })
  app.run('identity')
  expect(identity).toBe('identity')
})

test('Redefine internal services', () => {
  const myService = 'my-service'
  type Services = { myService: string }
  const app = createApplication<{
    internalServices: Services
  }>({
    getInternalServices: () => ({ myService }),
  })
  const { internalServices } = app.run(undefined, {
    getInternalServices: () => ({ myService: 'other-service' }),
  })
  expect(internalServices.myService).toBe('other-service')
})

test('Redefine external services', () => {
  const myService = 'my-service'
  type Services = { myService: string }
  const app = createApplication<{
    externalServices: Services
  }>({
    getExternalServices: () => ({ myService }),
  })
  const { externalServices } = app.run(undefined, {
    getExternalServices: () => ({
      myService: 'my-service-2',
    }),
  })
  expect(externalServices.myService).toBe('my-service-2')
})

test('Redefine pre-main', () => {
  const myService = 'my-service'
  type Services = { myService: string }
  const app = createApplication<{
    internalServices: Services
  }>({
    getInternalServices: () => ({ myService }),
  })
  const { internalServices } = app.run(undefined, {
    preMain: (internalServices) => {
      internalServices.myService += '-side-effect'
    },
  })
  expect(internalServices.myService).toBe('my-service-side-effect')
})

test('Redefine delivery', () => {
  const myService = 'my-service'
  type Services = { myService: 'my-service' }
  const app = createApplication<{
    internalServices: Services
    delivery: { AppComponent: () => JSX.Element }
  }>({
    getInternalServices: () => ({ myService }),
    getDelivery: ({ internalServices: { myService } }) => ({
      AppComponent: () => <span data-service={myService}></span>,
    }),
  })
  const { delivery } = app.run(undefined, {
    getDelivery: ({ internalServices: { myService } }) => ({
      AppComponent: () => <span data-service={`${myService}-change`}></span>,
    }),
  })
  expect(delivery?.AppComponent().props['data-service']).toEqual('my-service-change')
})

test('Redefine main', () => {
  const myService = 'my-service'
  type Services = { myService: 'my-service' }
  const app = createApplication<{
    internalServices: Services
    delivery: { AppComponent: () => JSX.Element }
  }>({
    getInternalServices: () => ({ myService }),
    getDelivery: ({ internalServices: { myService } }) => ({
      AppComponent: () => <span data-service={myService}></span>,
    }),
    main: ({ internalServices, delivery }) =>
      `${delivery.AppComponent().props['data-service']}-${internalServices.myService}`,
  })
  const { output } = app.run(undefined, {
    main: ({ internalServices, delivery }) =>
      `${delivery.AppComponent().props['data-service']}-${internalServices.myService}-change`,
  })
  expect(output).toEqual('my-service-my-service-change')
})

test('Error handling', () => {
  let error: unknown
  const app = createApplication({
    onError: (err) => {
      error = err
    },
    main() {
      throw new Error('error')
    },
  })
  expect(() => app.run()).toThrow('Could not run application')
  expect((error as Error).message).toBe('error')
})

test('Top level error handling', async () => {
  const onError = (): void => {}
  let cb
  const app = createApplication({
    onError,
    topLevelErrorHandling: (onErrorCb) => {
      cb = onErrorCb
    },
  })
  app.run()
  expect(cb).toBe(onError)
})

test('export state hook in delivery', () => {
  let exportData
  const myService = 'my-service'
  type Services = { myService: string }
  const app = createApplication<{
    internalServices: Services
    exportState: string
  }>({
    getInternalServices: () => ({
      myService,
    }),
    getDelivery: ({ exportState }) => {
      exportData = exportState()
      return {}
    },
    exportState: ({ myService }) => {
      return myService
    },
  })
  const { exportState } = app.run()
  expect(exportData).toEqual('my-service')
  expect(exportState()).toEqual('my-service')
})

test('importState can update internal services', () => {
  const myService = { value: 'my-service' }
  type Services = { myService: { value: string } }
  const app = createApplication<{
    internalServices: Services
    exportState: string
  }>({
    getInternalServices: () => ({ myService }),
    importState: ({ myService }, newState) => {
      myService.value += newState
    },
  })
  const { internalServices, importState } = app.run()
  importState('-new-state')
  expect(internalServices.myService.value).toBe('my-service-new-state')
})

test('Get pattern list', () => {
  const app1 = createApplication({})
  expect(app1.getArgs()).toEqual([{}])

  const app2 = createApplication()
  expect(app2.getArgs()).toEqual([{}])

  const app3 = createApplication({}, () => app1)
  expect(app3.getArgs()).toEqual([{}, {}])
})

test('Lazy loading base application', () => {
  let called = false
  const app1 = createApplication({})
  const app2 = createApplication({}, () => {
    called = true
    return app1
  })
  expect(called).toBe(false)
  app2.run()
  expect(called).toBe(true)
})

test('Register additional main after creation', () => {
  const baseApp = createApplication<{
    output: number
    identity: { type: 'type-1' | 'type-2' | 'type-3' }
  }>({
    main: () => 3,
  })
  const app = createApplication(
    {
      main: [
        {
          patternPartial: { type: 'type-1' },
          value: () => 1,
        },
        {
          patternPartial: { type: 'type-2' },
          value: () => 2,
        },
      ],
    },
    () => baseApp,
  )
  const { output: output1 } = app.run({ type: 'type-1' })
  expect(output1).toBe(1)
  const { output: output2 } = app.run({ type: 'type-2' })
  expect(output2).toBe(2)
  const { output: output3 } = app.run({ type: 'type-3' })
  expect(output3).toBe(3)
})

test('Register additional main after creation', () => {
  const baseApp = createApplication<{
    output: number
    identity: { type: 'type-1' | 'type-2' | 'type-3' }
  }>({
    main: [
      {
        patternPartial: { type: 'type-1' },
        value: () => 1,
      },
      {
        patternPartial: { type: 'type-2' },
        value: () => 2,
      },
    ],
  })
  const app = createApplication({}, () => baseApp)
  const { output: output1 } = app.run({ type: 'type-1' })
  expect(output1).toBe(1)
  const { output: output2 } = app.run({ type: 'type-2' })
  expect(output2).toBe(2)
  expect(() => app.run({ type: 'type-3' })).toThrow()
})
