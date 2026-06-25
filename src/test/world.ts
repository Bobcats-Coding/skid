import type {
  FilterRecord,
  GetKey,
  GetValue,
  GetValueByKey,
  RecordToEntries,
} from '../core/type.js'
import { assertDefined, assertTypeByGuard } from '../core/util.js'
import { instantiateService } from './test-environment.js'
import type {
  ConfigEntry,
  GetContext,
  GetInstance,
  GetInstanceEntry,
  InteractorConfig,
  RunnerConfig,
  ServiceConfig,
  TestEnviornmentState,
} from './type.js'

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

  const get: TestEnvironmentWorld<SERVICES>['get'] = (name) =>
    assertTypeByGuard({
      value: interactorContexts.get(name),
      guard: (interactor): interactor is GetValueByKey<Interactors, typeof name> =>
        interactor !== undefined,
      message: `Interactor "${String(name)}" is not registered`,
    })

  const start: TestEnvironmentWorld<SERVICES>['start'] = async (name, ...arg) => {
    const service = assertDefined(
      state.serviceConfigs[name],
      `Service "${String(name)}" is not in the configuration`,
    )
    const instantiatedService = await instantiateService(service, ...arg)
    await instantiatedService.instance.start()
    if (isInteractorConfig(service)) {
      const context: GetContext<GetInstance<GetValue<Interactors>>> = (
        await instantiatedService.instance.startContext()
      ).context
      register(name, context)
      state.interactors.set(name, instantiatedService)
    }
    if (isRunnerConfig(service)) {
      state.runners.set(name, instantiatedService)
    }
    console.log(`${name}: Started in step`)
  }

  const register: TestEnvironmentWorld<SERVICES>['register'] = (name, context) => {
    interactorContexts.set(name, context)
  }

  return {
    get,
    start,
    register,
  }
}

const isInteractorConfig = (service: ServiceConfig | undefined): service is InteractorConfig =>
  service?.type === 'interactor'

const isRunnerConfig = (service: ServiceConfig | undefined): service is RunnerConfig =>
  service?.type === 'runner'
