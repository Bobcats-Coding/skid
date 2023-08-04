export type Application<
  EXTERNAL_SERVICES extends Record<string, any>,
  INTERNAL_SERVICES extends Record<string, any>,
  DELIVERY extends Record<string, any>,
  OUTPUT = number,
  RUN_ARGS = Partial<AppArgs<EXTERNAL_SERVICES, INTERNAL_SERVICES, DELIVERY>>,
  RUN_RETURN = {
    services: INTERNAL_SERVICES & EXTERNAL_SERVICES
    delivery: DELIVERY
    output: OUTPUT
  },
> = {
  readonly run: (args?: RUN_ARGS) => RUN_RETURN | undefined
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
  readonly main?: (arg: { services: INTERNAL_SERVICES; delivery: DELIVERY }) => any
  readonly onError?: (err: Error) => void
  readonly topLevelErrorHandling?: (cb: (err: Error) => void) => void
}

export const createApplication = <
  EXTERNAL_SERVICES extends Record<string, any> = {},
  INTERNAL_SERVICES extends Record<string, any> = {},
  DELIVERY extends Record<string, any> = {},
  OUTPUT = number,
>(
  appArgs: AppArgs<EXTERNAL_SERVICES, INTERNAL_SERVICES, DELIVERY>,
): Application<EXTERNAL_SERVICES, INTERNAL_SERVICES, DELIVERY, OUTPUT> => ({
  run: (runArgs = {}) => {
    // Need to cast the default values because these are independent from the template variables
    const defaults = {
      getInternalServices: (services: EXTERNAL_SERVICES) =>
        services as unknown as INTERNAL_SERVICES,
      getExternalServices: () => ({} as unknown as EXTERNAL_SERVICES),
      preMain: () => {},
      getDelivery: () => ({} as unknown as DELIVERY),
      main: () => 0,
      onError: () => {},
      topLevelErrorHandling: (_: (err: Error) => void) => {},
    }
    const {
      getExternalServices,
      getInternalServices,
      preMain,
      getDelivery,
      main,
      onError,
      topLevelErrorHandling,
    } = { ...defaults, ...appArgs, ...runArgs }
    try {
      topLevelErrorHandling(onError)
      const externalServices = getExternalServices()
      const internalServices = getInternalServices(externalServices)
      preMain(internalServices)
      const delivery = getDelivery(internalServices)
      const output = main({ services: internalServices, delivery })
      const services = { ...externalServices, ...internalServices }
      return { services, delivery, output }
    } catch (err) {
      onError(err as Error)
      return undefined
    }
  },
})
