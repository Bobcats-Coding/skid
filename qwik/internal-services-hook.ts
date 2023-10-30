import { type Application } from '@bobcats-coding/skid/core/application'

type InternalServicesHook<
  INTERNAL_SERVICES extends Record<string, any>,
  APPLICATIONS extends Record<string, Application<any, INTERNAL_SERVICES, any>>,
> = {
  useInternalServices: <SERVICE_NAME extends keyof INTERNAL_SERVICES>(
    key: keyof APPLICATIONS,
    service: SERVICE_NAME,
  ) => INTERNAL_SERVICES[SERVICE_NAME]
  loadServerInternalServices: (key: keyof APPLICATIONS, services: INTERNAL_SERVICES) => void
}

export const createInternalServicesHook = <
  INTERNAL_SERVICES extends Record<string, any>,
  const APPLICATIONS extends Record<string, Application<any, INTERNAL_SERVICES, any>>,
>(
  applications: APPLICATIONS,
): InternalServicesHook<INTERNAL_SERVICES, APPLICATIONS> => {
  const serverServicesByKey = new Map<keyof APPLICATIONS, INTERNAL_SERVICES>()

  return {
    useInternalServices: (key, service) => {
      if (serverServicesByKey.has(key)) {
        const serverServices = serverServicesByKey.get(key)
        if (serverServices !== undefined) {
          return serverServices[service]
        }
      }
      const application = applications[key]
      if (application === undefined) {
        throw new Error(`Internal services are not set for "${key as string}"`)
      }
      const internalServices: INTERNAL_SERVICES = application.injectInternalServices()
      return internalServices[service]
    },
    loadServerInternalServices: (key, services) => {
      serverServicesByKey.set(key, services)
    },
  }
}
