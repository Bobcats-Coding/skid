export type Application<
  EXTERNAL_SERVICES extends Record<string, any>,
  INTERNAL_SERVICES extends Record<string, any>,
  DELIVERY extends Record<string, any>,
  OUTPUT = number,
  RUN_ARGS = Partial<AppArgs<EXTERNAL_SERVICES, INTERNAL_SERVICES, DELIVERY>>,
  RUN_RETURN = {
    services: INTERNAL_SERVICES
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
  readonly preRender?: (services: INTERNAL_SERVICES) => void
  readonly getDelivery?: (services: INTERNAL_SERVICES) => DELIVERY
  readonly render?: (arg: { services: INTERNAL_SERVICES; delivery: DELIVERY }) => any
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
    // Need to cast the default valuse because these are independent from the template variables
    const defaults = {
      getInternalServices: (services: EXTERNAL_SERVICES) =>
        services as unknown as INTERNAL_SERVICES,
      getExternalServices: () => ({}) as unknown as EXTERNAL_SERVICES,
      preRender: () => {},
      getDelivery: () => ({}) as unknown as DELIVERY,
      render: () => 0,
      onError: () => {},
      topLevelErrorHandling: (_: (err: Error) => void) => {},
    }
    const {
      getExternalServices,
      getInternalServices,
      preRender,
      getDelivery,
      render,
      onError,
      topLevelErrorHandling,
    } = { ...defaults, ...appArgs, ...runArgs }
    try {
      topLevelErrorHandling(onError)
      const services = getInternalServices(getExternalServices())
      preRender(services)
      const delivery = getDelivery(services)
      const output = render({ services, delivery })
      return { services, delivery, output }
    } catch (err) {
      onError(err as Error)
      return undefined
    }
  },
})
