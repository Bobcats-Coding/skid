import { createApplication } from './application'

test('Get external services', () => {
  const myService = 'my-service'
  type Services = { myService: 'my-service' }
  const app = createApplication<Services, Services>({
    getExternalServices: () => ({ myService }),
  })
  const { services } = app.run() ?? {}
  expect(services?.myService).toBe('my-service')
})

test('Get internal services', () => {
  const myExternalService = 'my-service'
  type ExternalServices = { myExternalService: 'my-service' }
  type InternalServices = { myService: 'my-service' }
  const app = createApplication<ExternalServices, InternalServices>({
    getExternalServices: () => ({ myExternalService }),
    getInternalServices: ({ myExternalService }) => ({
      myService: myExternalService,
    }),
  })
  const { services } = app.run() ?? {}
  expect(services?.myService).toBe('my-service')
})

test('Pre-main can execute side-effects', () => {
  const myService = 'my-service'
  type Services = { myService: string }
  const app = createApplication<Services, Services>({
    getExternalServices: () => ({ myService }),
    preMain: (services) => {
      services.myService += '-side-effect'
    },
  })
  const { services } = app.run() ?? {}
  expect(services?.myService).toBe('my-service-side-effect')
})

test('Get delivery', () => {
  const myService = 'my-service'
  type Services = { myService: 'my-service' }
  const app = createApplication<Services, Services, { AppComponent: () => JSX.Element }>({
    getExternalServices: () => ({ myService }),
    getDelivery: ({ myService }) => ({
      AppComponent: () => <span>{myService}</span>,
    }),
  })
  const { delivery } = app.run() ?? {}
  expect(delivery?.AppComponent().props.children).toEqual('my-service')
})

test('main', () => {
  const myService = 'my-service'
  type Services = { myService: 'my-service' }
  const app = createApplication<Services, Services, { AppComponent: () => JSX.Element }>({
    getExternalServices: () => ({ myService }),
    getDelivery: ({ myService }) => ({
      AppComponent: () => <span>{myService}</span>,
    }),
    main: ({ services, delivery }) =>
      `${delivery.AppComponent().props.children as string}-${services.myService}`,
  })
  const { output } = app.run() ?? {}
  expect(output).toEqual('my-service-my-service')
})

test('Redefine external services', () => {
  const myService = 'my-service'
  type Services = { myService: string }
  const app = createApplication<Services, Services>({
    getExternalServices: () => ({ myService }),
  })
  const { services } =
    app.run({
      getExternalServices: () => ({ myService: 'other-service' }),
    }) ?? {}
  expect(services?.myService).toBe('other-service')
})

test('Redefine internal services', () => {
  const myExternalService = 'my-service'
  type ExternalServices = { myExternalService: 'my-service' }
  type InternalServices = { myService: string }
  const app = createApplication<ExternalServices, InternalServices>({
    getExternalServices: () => ({ myExternalService }),
    getInternalServices: ({ myExternalService }) => ({
      myService: myExternalService,
    }),
  })
  const { services } =
    app.run({
      getInternalServices: ({ myExternalService }) => ({
        myService: myExternalService + '-2',
      }),
    }) ?? {}
  expect(services?.myService).toBe('my-service-2')
})

test('Redefine pre-main', () => {
  const myService = 'my-service'
  type Services = { myService: string }
  const app = createApplication<Services, Services>({
    getExternalServices: () => ({ myService }),
  })
  const { services } =
    app.run({
      preMain: (services) => {
        services.myService += '-side-effect'
      },
    }) ?? {}
  expect(services?.myService).toBe('my-service-side-effect')
})

test('Redefine delivery', () => {
  const myService = 'my-service'
  type Services = { myService: 'my-service' }
  const app = createApplication<Services, Services, { AppComponent: () => JSX.Element }>({
    getExternalServices: () => ({ myService }),
    getDelivery: ({ myService }) => ({
      AppComponent: () => <span>{myService}</span>,
    }),
  })
  const { delivery } =
    app.run({
      getDelivery: ({ myService }) => ({
        AppComponent: () => <span>{`${myService}-change`}</span>,
      }),
    }) ?? {}
  expect(delivery?.AppComponent().props.children).toEqual('my-service-change')
})

test('Redefine main', () => {
  const myService = 'my-service'
  type Services = { myService: 'my-service' }
  const app = createApplication<Services, Services, { AppComponent: () => JSX.Element }>({
    getExternalServices: () => ({ myService }),
    getDelivery: ({ myService }) => ({
      AppComponent: () => <span>{myService}</span>,
    }),
    main: ({ services, delivery }) =>
      `${delivery.AppComponent().props.children as string}-${services.myService}`,
  })
  const { output } =
    app.run({
      main: ({ services, delivery }) =>
        `${delivery.AppComponent().props.children as string}-${services.myService}-change`,
    }) ?? {}
  expect(output).toEqual('my-service-my-service-change')
})

test('Error handling', () => {
  let error: Error | undefined
  type Services = { myService: 'my-service' }
  const app = createApplication<Services, Services>({
    onError: (err) => {
      error = err
    },
    main() {
      throw new Error('error')
    },
  })
  app.run()
  expect(error?.message).toBe('error')
})

test('Error handling', async () => {
  type Services = { myService: 'my-service' }
  const onError = (): void => {}
  let cb
  const app = createApplication<Services, Services>({
    onError,
    topLevelErrorHandling: (onErrorCb) => {
      cb = onErrorCb
    },
  })
  app.run()
  expect(cb).toBe(onError)
})
