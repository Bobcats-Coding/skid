import type { FilterRecord, GetKey, GetValue, GetValueByKey, RecordToEntries } from '../core/type'
import type {
  ConfigEntry,
  GetContext,
  GetInstance,
  GetInstanceEntry,
  InteractorConfig,
  RunnerConfig,
  ServiceConfig,
  TestEnviornmentState,
} from './type'

export type TestEnvironmentWorld<
  SERVICES extends Record<string, ServiceConfig>,
  INTERACTORS extends ConfigEntry = RecordToEntries<FilterRecord<SERVICES, InteractorConfig>>,
  SERVICE_NAMES extends GetKey<RecordToEntries<SERVICES>> = GetKey<RecordToEntries<SERVICES>>,
> = {
  get: <NAME extends GetKey<INTERACTORS>>(
    name: NAME,
  ) => GetContext<GetInstance<GetValueByKey<INTERACTORS, NAME>>>
  register: <NAME extends GetKey<INTERACTORS>>(
    name: NAME,
    context: GetContext<GetInstance<GetValueByKey<INTERACTORS, NAME>>>,
  ) => void
  start: (
    name: SERVICE_NAMES,
    ...args: Parameters<SERVICES[SERVICE_NAMES]['creator']>
  ) => Promise<void>
}

export const createWorld = <SERVICES extends Record<string, ServiceConfig>>(
  state: TestEnviornmentState<SERVICES>,
): TestEnvironmentWorld<SERVICES> => {
  type Interactors = GetInstanceEntry<RecordToEntries<FilterRecord<SERVICES, InteractorConfig>>>
  const interactorContexts = new Map<GetKey<Interactors>, GetContext<GetValue<Interactors>>>()

  return {
    get: (name) => {
      const interactor = interactorContexts.get(name)
      const isPresent = (interactor: any): interactor is GetValueByKey<Interactors, typeof name> =>
        interactor !== undefined
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
        const context: GetContext<GetInstance<GetValue<Interactors>>> = (
          await instance.startContext()
        ).context
        interactorContexts.set(name, context)
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
      console.log(`${name}: Started in step`)
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
