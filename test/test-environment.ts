import { map, merge } from 'rxjs'
import type { Observable } from 'rxjs'

export type Runner = {
  start: () => Promise<void>
  stop: () => Promise<void>
}

export type Interactor<CONTEXT = any> = {
  startContext: () => Promise<{ context: CONTEXT; reportEntry$: Observable<ReportEntry> }>
  stopContext: (context: CONTEXT) => Promise<void>
  onFailure: (context: CONTEXT, testName: string) => Promise<ReportEntry>
} & Runner

export type NamedInstance<
  NAME extends string = string,
  INSTANCE extends Interactor | Runner = Interactor | Runner,
> = {
  name: NAME
  instance: INSTANCE
}

export type TestEnviornmentConfig = Record<string, RunnerConfig | InteractorConfig>

type ServicesToNamedInstance<
  SERVICES extends Record<string, InteractorConfig | RunnerConfig>,
  KEY = keyof SERVICES,
> = KEY extends string
  ? KEY extends keyof SERVICES
    ? NamedInstance<KEY, ReturnType<SERVICES[KEY]['creator']>>
    : never
  : never

type GetContextByName<
  INTERACTORS extends NamedInstance,
  NAME extends string,
> = INTERACTORS extends NamedInstance<NAME, infer C>
  ? C extends Interactor
    ? GetContext<C>
    : never
  : never

export type TestEnvironmentWorld<
  SERVICES extends Record<string, RunnerConfig | InteractorConfig>,
  INTERACTORS extends NamedInstance = ServicesToNamedInstance<
    FilterConfigByType<SERVICES, InteractorConfig>
  >,
  SERVICE_NAMES extends ServicesToNamedInstance<SERVICES>['name'] = ServicesToNamedInstance<SERVICES>['name'],
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

type GetContext<INTERACTOR extends Interactor> = INTERACTOR extends Interactor<infer CONTEXT>
  ? CONTEXT
  : never

const createWorld = <SERVICES extends Record<string, RunnerConfig | InteractorConfig>>(
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

const isInteractorConfig = (
  service: InteractorConfig | RunnerConfig | undefined,
): service is InteractorConfig => service?.type === 'interactor'

const isRunnerConfig = (
  service: InteractorConfig | RunnerConfig | undefined,
): service is RunnerConfig => service?.type === 'runner'

export type ReportEntry =
  | {
      entry: string
      type: 'text/plain'
    }
  | {
      entry: Buffer
      type: 'image/png'
    }

export type TestEnviornment<SERVICES extends Record<string, RunnerConfig | InteractorConfig>> = {
  onBeforeAll: () => Promise<void>
  onAfterAll: () => Promise<void>
  onBefore: (world: TestEnvironmentWorld<SERVICES>) => Promise<Observable<ReportEntry>>
  onAfter: (world: TestEnvironmentWorld<SERVICES>) => Promise<void>
  onFailure: (world: TestEnvironmentWorld<SERVICES>, testName: string) => Promise<ReportEntry[]>
  createWorld: () => TestEnvironmentWorld<SERVICES>
}

type DefaultConfig = { hook?: 'before-all' | 'before' }
type RunnerConfig<RUNNER = any, ARGS extends any[] = any[]> = {
  type: 'runner'
  creator: (...args: ARGS) => RUNNER
} & DefaultConfig
type InteractorConfig<INTERACTOR = any, ARGS extends any[] = any[]> = {
  type: 'interactor'
  creator: (...args: ARGS) => INTERACTOR
} & DefaultConfig

type RunnerInstance = { instance: Runner } & DefaultConfig
type InteractorInstance = { instance: Interactor } & DefaultConfig

type FilterConfigByType<
  SERVICES extends Record<string, RunnerConfig | InteractorConfig>,
  TYPE extends RunnerConfig | InteractorConfig,
> = {
  [K in keyof SERVICES]: SERVICES[K] extends TYPE ? SERVICES[K] : never
}

type TestEnviornmentState<
  SERVICES extends Record<string, RunnerConfig | InteractorConfig>,
  INTERACTORS extends NamedInstance = ServicesToNamedInstance<
    FilterConfigByType<SERVICES, InteractorConfig>
  >,
  RUNNERS extends NamedInstance = ServicesToNamedInstance<
    FilterConfigByType<SERVICES, RunnerConfig>
  >,
> = {
  services: SERVICES
  interactors: Map<INTERACTORS['name'], { instance: INTERACTORS['instance'] } & DefaultConfig>
  runners: Map<RUNNERS['name'], { instance: RUNNERS['instance'] } & DefaultConfig>
}

export const createTestEnvironment = <
  SERVICES extends Record<string, RunnerConfig | InteractorConfig>,
>(
  services: SERVICES,
): TestEnviornment<SERVICES> => {
  type Interactor = ServicesToNamedInstance<FilterConfigByType<SERVICES, InteractorConfig>>
  type Runner = ServicesToNamedInstance<FilterConfigByType<SERVICES, RunnerConfig>>

  const isInteractorEntry = (
    entry: [string, RunnerConfig | InteractorConfig],
  ): entry is [string, InteractorConfig] => entry[1].type === 'interactor'

  const isRunnerEntry = (
    entry: [string, RunnerConfig | InteractorConfig],
  ): entry is [string, RunnerConfig] => entry[1].type === 'runner'

  const state: TestEnviornmentState<SERVICES> = {
    services,
    interactors: new Map<string, { instance: Interactor['instance'] } & DefaultConfig>(
      Object.entries(services)
        .filter(isInteractorEntry)
        .map(([key, { creator, hook }]) => [
          key,
          { instance: creator(), ...(Boolean(hook) && { hook }) },
        ]),
    ),
    runners: new Map<string, { instance: Runner['instance'] } & DefaultConfig>(
      Object.entries(services)
        .filter(isRunnerEntry)
        .map(([key, { creator, hook }]) => [
          key,
          { instance: creator(), ...(Boolean(hook) && { hook }) },
        ]),
    ),
  }

  const asyncTransform = async <T, R>(
    iterable: Iterable<T>,
    transform: (list: T[]) => Array<Promise<R>>,
  ): Promise<R[]> => await Promise.all(transform([...iterable]))

  const forEachRunner = async (
    mapper: (runner: RunnerInstance) => Promise<void>,
  ): Promise<void> => {
    await asyncTransform(state.runners.values(), (list) => list.map(mapper))
  }

  const forEachBeforeAllInteractor = async (
    mapper: (interactor: InteractorInstance) => Promise<void>,
  ): Promise<void> => {
    await asyncTransform(state.interactors.values(), (list) =>
      list.filter(({ hook }) => hook === 'before-all').map(mapper),
    )
  }

  const forEachInteractor = async (
    mapper: (interactor: InteractorInstance) => Promise<void>,
  ): Promise<void> => {
    await asyncTransform(state.interactors.values(), (list) => list.map(mapper))
  }

  const forEachBeforeInteractor = async (
    mapper: (interactor: InteractorInstance) => Promise<void>,
  ): Promise<void> => {
    await asyncTransform(state.interactors.values(), (list) =>
      list.filter(({ hook }) => hook === 'before').map(mapper),
    )
  }

  const mapInteractors = async <T>(
    mapper: (key: Interactor['name'], interactor: InteractorInstance) => Promise<T>,
  ): Promise<T[]> =>
    await asyncTransform(state.interactors.entries(), (list) =>
      list.map(async ([key, interactor]) => await mapper(key, interactor)),
    )

  return {
    onBeforeAll: async () => {
      await forEachRunner(async ({ instance, hook }) => {
        if (hook === 'before-all') {
          await instance.start()
        }
      })
      await forEachBeforeAllInteractor(async ({ instance }) => {
        await instance.start()
      })
    },
    onAfterAll: async () => {
      await forEachRunner(async ({ instance }) => {
        await instance.stop()
      })
      await forEachBeforeAllInteractor(async ({ instance }) => {
        await instance.stop()
      })
    },
    onBefore: async (world) => {
      await forEachBeforeInteractor(async ({ instance }) => {
        await instance.start()
      })
      const reportEntries = await mapInteractors(async (name, { instance }) => {
        const { context, reportEntry$ } = await instance.startContext()
        world.register(name, context)
        return reportEntry$.pipe(
          map(({ entry, type }) =>
            type === 'text/plain' ? { type, entry: `${String(name)}: ${entry}` } : { type, entry },
          ),
        )
      })
      return merge<ReportEntry[]>(...reportEntries)
    },
    onAfter: async (world) => {
      await mapInteractors(async (name, { instance }) => {
        await instance.stopContext(world.get(name))
      })
      await forEachInteractor(async ({ instance, hook }) => {
        if (hook !== 'before-all') {
          await instance.stop()
        }
      })
    },
    onFailure: async (world, testName) => {
      return await mapInteractors(async (name, { instance }) => {
        return await instance.onFailure(world.get(name), testName)
      })
    },
    createWorld: () => createWorld<SERVICES>(state),
  }
}
