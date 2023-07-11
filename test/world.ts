import type {
  FilterConfigByType,
  GetContext,
  GetContextByName,
  InteractorConfig,
  NamedInstance,
  RunnerConfig,
  ServiceConfig,
  ServicesToNamedInstance,
  TestEnviornmentState,
} from './type'

export type TestEnvironmentWorld<
  SERVICES extends Record<string, ServiceConfig>,
  INTERACTORS extends NamedInstance = ServicesToNamedInstance<
    FilterConfigByType<SERVICES, InteractorConfig>
  >,
  SERVICE_NAMES extends
    ServicesToNamedInstance<SERVICES>['name'] = ServicesToNamedInstance<SERVICES>['name'],
> = {
  get: <NAME extends INTERACTORS['name']>(name: NAME) => GetContextByName<INTERACTORS, NAME>
  register: <NAME extends INTERACTORS['name']>(
    name: NAME,
    context: GetContextByName<INTERACTORS, NAME>,
  ) => void
  start: (
    name: SERVICE_NAMES,
    ...args: Parameters<SERVICES[SERVICE_NAMES]['creator']>
  ) => Promise<void>
}

export const createWorld = <SERVICES extends Record<string, ServiceConfig>>(
  state: TestEnviornmentState<SERVICES>,
): TestEnvironmentWorld<SERVICES> => {
  type Interactors = ServicesToNamedInstance<FilterConfigByType<SERVICES, InteractorConfig>>
  const interactorContexts: Map<
    Interactors['name'],
    GetContext<Interactors['instance']>
  > = new Map()

  return {
    get: (name) => {
      const interactor = interactorContexts.get(name)
      const isPresent = (
        interactor: any,
      ): interactor is GetContextByName<Interactors, typeof name> => interactor !== undefined
      if (!isPresent(interactor)) {
        throw new Error(`Interactor "${String(name)}" is not registered`)
      }
      return interactor
    },
    start: async (name, ...arg) => {
      const service = state.services[name]
      if (service === undefined) {
        throw new Error(`Service "${String(name)}" is not in the configuration`)
      }
      if (isInteractorConfig(service)) {
        const instance = service.creator(...arg)
        await instance.start()
        interactorContexts.set(name, (await instance.startContext()).context)
        state.interactors.set(name, {
          instance,
          ...('hook' in service ? { hook: service.hook } : {}),
        })
      }
      if (isRunnerConfig(service)) {
        const instance = service.creator(...arg)
        await instance.start()
        state.runners.set(name, {
          instance,
          ...('hook' in service ? { hook: service.hook } : {}),
        })
      }
    },
    register: (name, context) => {
      interactorContexts.set(name, context)
    },
  }
}

const isInteractorConfig = (service: ServiceConfig | undefined): service is InteractorConfig =>
  service?.type === 'interactor'

const isRunnerConfig = (service: ServiceConfig | undefined): service is RunnerConfig =>
  service?.type === 'runner'
