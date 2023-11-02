import { type Application } from '@bobcats-coding/skid/core/application'

type InternalServicesHook<
  INTERNAL_SERVICES extends Record<string, any>,
  APPLICATIONS extends Record<string, () => Application<any, INTERNAL_SERVICES, any, any>>,
> = {
  useInternalServices: <SERVICE_NAME extends keyof INTERNAL_SERVICES>(
    key: keyof APPLICATIONS,
    service?: SERVICE_NAME,
  ) => typeof service extends undefined ? INTERNAL_SERVICES : INTERNAL_SERVICES[SERVICE_NAME]
  loadServerInternalServices: (key: keyof APPLICATIONS, services: INTERNAL_SERVICES) => void
}

export const createInternalServicesHook = <
  INTERNAL_SERVICES extends Record<string, any>,
  const APPLICATIONS extends Record<string, () => Application<any, INTERNAL_SERVICES, any, any>>,
>(
  applications: APPLICATIONS,
): InternalServicesHook<INTERNAL_SERVICES, APPLICATIONS> => {
  const serverServicesByKey = new Map<keyof APPLICATIONS, INTERNAL_SERVICES>()

  type UseInternalServicesReturnType<SERVICE_NAME extends keyof INTERNAL_SERVICES> =
    SERVICE_NAME extends undefined ? INTERNAL_SERVICES : INTERNAL_SERVICES[SERVICE_NAME]

  const useInternalServices = <SERVICE_NAME extends keyof INTERNAL_SERVICES>(
    key: keyof APPLICATIONS,
    service?: SERVICE_NAME,
  ): SERVICE_NAME extends undefined ? INTERNAL_SERVICES : INTERNAL_SERVICES[SERVICE_NAME] => {
    if (serverServicesByKey.has(key)) {
      const serverServices = serverServicesByKey.get(key)
      if (serverServices !== undefined) {
        if (service === undefined) {
          return serverServices as UseInternalServicesReturnType<SERVICE_NAME>
        }
        return serverServices[service]
      }
    }
    const application = applications[key]
    if (application === undefined) {
      throw new Error(`Internal services are not set for "${key as string}"`)
    }
    const internalServices: INTERNAL_SERVICES = application().injectInternalServices()
    if (service === undefined) {
      return internalServices as UseInternalServicesReturnType<SERVICE_NAME>
    }
    return internalServices[service]
  }

  return {
    useInternalServices,
    loadServerInternalServices: (key, services) => {
      serverServicesByKey.set(key, services)
    },
  }
}
