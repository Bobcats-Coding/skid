export type Application<
  EXTERNAL_SERVICES extends Record<string, any>,
  INTERNAL_SERVICES extends Record<string, any>,
  DELIVERY extends Record<string, any>,
  MAIN = Main<INTERNAL_SERVICES, DELIVERY>,
  OUTPUT = number,
  RUN_RETURN = {
    services: INTERNAL_SERVICES & EXTERNAL_SERVICES
    delivery: DELIVERY
    output: OUTPUT
  },
> = {
  readonly run: (
    ...args: MAIN extends (...args: any[]) => any
      ? SingleMainRunArgs<EXTERNAL_SERVICES, INTERNAL_SERVICES, DELIVERY>
      : MultiMainRunArgs<EXTERNAL_SERVICES, INTERNAL_SERVICES, DELIVERY, MAIN>
  ) => RUN_RETURN | undefined
  readonly getInternalServices: () => INTERNAL_SERVICES
}

type Main<
  INTERNAL_SERVICES extends Record<string, any>,
  DELIVERY extends Record<string, any>,
> = (arg: { services: INTERNAL_SERVICES; delivery: DELIVERY }) => any

type SingleMainRunArgs<
  EXTERNAL_SERVICES extends Record<string, any>,
  INTERNAL_SERVICES extends Record<string, any>,
  DELIVERY extends Record<string, any>,
  RUN_ARGS = Partial<AppArgs<EXTERNAL_SERVICES, INTERNAL_SERVICES, DELIVERY>>,
> = [RUN_ARGS] | []

type MultiMainRunArgs<
  EXTERNAL_SERVICES extends Record<string, any>,
  INTERNAL_SERVICES extends Record<string, any>,
  DELIVERY extends Record<string, any>,
  MAIN = Record<string, Main<INTERNAL_SERVICES, DELIVERY>>,
  RUN_ARGS = Partial<AppArgs<EXTERNAL_SERVICES, INTERNAL_SERVICES, DELIVERY>>,
> = [keyof MAIN, RUN_ARGS] | [keyof MAIN]

const isSingleMainRunArgs = (args: any[]): args is SingleMainRunArgs<any, any, any> => {
  return typeof args[0] === 'object' || args[0] === undefined
}

export type AppArgs<
  EXTERNAL_SERVICES extends Record<string, any>,
  INTERNAL_SERVICES extends Record<string, any>,
  DELIVERY extends Record<string, any>,
> = {
  readonly getInternalServices?: (externalServices: EXTERNAL_SERVICES) => INTERNAL_SERVICES
  readonly getExternalServices?: () => EXTERNAL_SERVICES
  readonly preMain?: (services: INTERNAL_SERVICES) => void
  readonly getDelivery?: (services: INTERNAL_SERVICES) => DELIVERY
  readonly main?:
    | Record<string, Main<INTERNAL_SERVICES, DELIVERY>>
    | Main<INTERNAL_SERVICES, DELIVERY>
  readonly onError?: (err: Error) => void
  readonly topLevelErrorHandling?: (cb: (err: Error) => void) => void
}

export const createApplication = <
  EXTERNAL_SERVICES extends Record<string, any> = Record<string, never>,
  INTERNAL_SERVICES extends Record<string, any> = Record<string, never>,
  DELIVERY extends Record<string, any> = Record<string, never>,
  MAIN = (arg: { services: INTERNAL_SERVICES; delivery: DELIVERY }) => any,
  OUTPUT = number,
>(
  appArgs: AppArgs<EXTERNAL_SERVICES, INTERNAL_SERVICES, DELIVERY>,
): Application<EXTERNAL_SERVICES, INTERNAL_SERVICES, DELIVERY, MAIN, OUTPUT> => {
  type Run = Application<EXTERNAL_SERVICES, INTERNAL_SERVICES, DELIVERY, MAIN, OUTPUT>['run']

  type RunArgs = Partial<AppArgs<EXTERNAL_SERVICES, INTERNAL_SERVICES, DELIVERY>>

  const SHARED_DEFAULTS = {
    getExternalServices: () => ({}) as unknown as EXTERNAL_SERVICES,
    getInternalServices: (services: EXTERNAL_SERVICES) => services as unknown as INTERNAL_SERVICES,
  }

  // Need to cast the default values because these are independent from the template variables
  const DEFAULTS = {
    ...SHARED_DEFAULTS,
    preMain: () => {},
    getDelivery: () => ({}) as unknown as DELIVERY,
    main: (() => 0) as unknown as Main<INTERNAL_SERVICES, DELIVERY>,
    onError: (err: Error) => {
      console.error(err)
    },
    topLevelErrorHandling: (_: (err: Error) => void) => {},
  }

  const run: Run = (...args: Parameters<Run>) => {
    const getSingleArgs = (args: SingleMainRunArgs<any, any, any>): RunArgs => {
      return args[0] ?? {}
    }

    const runArgs: RunArgs | undefined = isSingleMainRunArgs(args)
      ? getSingleArgs(args)
      : args[1] ?? {}

    const {
      getExternalServices,
      getInternalServices,
      preMain,
      getDelivery,
      main,
      onError,
      topLevelErrorHandling,
    } = { ...DEFAULTS, ...appArgs, ...runArgs }

    const mainToCall =
      (typeof main === 'function' ? main : main[args[0] as string]) ?? DEFAULTS.main

    try {
      topLevelErrorHandling(onError)
      const externalServices = getExternalServices()
      const internalServices = getInternalServices(externalServices)
      preMain(internalServices)
      const delivery = getDelivery(internalServices)
      const output = mainToCall({ services: internalServices, delivery })
      const services = { ...externalServices, ...internalServices }
      return { services, delivery, output }
    } catch (err) {
      console.error(err)
      onError(err as Error)
      return undefined
    }
  }

  const getInternalServices = (): INTERNAL_SERVICES => {
    const { getExternalServices, getInternalServices } = { ...SHARED_DEFAULTS, ...appArgs }
    const externalServices = getExternalServices()
    const internalServices = getInternalServices(externalServices)
    return internalServices
  }

  return { run, getInternalServices }
}
