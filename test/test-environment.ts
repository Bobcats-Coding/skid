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

export type NamedInteractor<
  NAME extends string = string,
  INTERACTOR extends Interactor = Interactor,
> = {
  name: NAME
  interactor: INTERACTOR
}

type ServicesToNamedInteractor<
  SERVICES extends Record<string, InteractorConfig>,
  KEY = keyof SERVICES,
> = KEY extends string
  ? KEY extends keyof SERVICES
    ? NamedInteractor<KEY, ReturnType<SERVICES[KEY]['creator']>>
    : never
  : never

export type TestEnvironmentWorld<INTERACTORS extends NamedInteractor> = {
  get: <NAME extends INTERACTORS['name']>(
    name: NAME,
  ) => INTERACTORS extends NamedInteractor<NAME, infer C> ? GetContext<C> : never
  register: <NAME extends INTERACTORS['name']>(
    name: NAME,
    context: INTERACTORS extends NamedInteractor<NAME, infer I> ? GetContext<I> : never,
  ) => void
}

type GetContext<INTERACTOR extends Interactor> = INTERACTOR extends Interactor<infer CONTEXT>
  ? CONTEXT
  : never

const createWorld = <INTERACTORS extends NamedInteractor>(): TestEnvironmentWorld<INTERACTORS> => {
  const interactors: Map<INTERACTORS['name'], GetContext<INTERACTORS['interactor']>> = new Map()

  return {
    get: (name) => {
      const interactor = interactors.get(name)
      if (interactor === undefined) {
        throw new Error(`Interactor "${String(name)}" is not registered`)
      }
      return interactor
    },
    register: (name, context) => {
      interactors.set(name, context)
    },
  }
}

export type ReportEntry =
  | {
      entry: string
      type: 'text/plain'
    }
  | {
      entry: Buffer
      type: 'image/png'
    }

export type TestEnviornment<INTERACTORS extends NamedInteractor> = {
  onBeforeAll: () => Promise<void>
  onAfterAll: () => Promise<void>
  onBefore: (world: TestEnvironmentWorld<INTERACTORS>) => Promise<Observable<ReportEntry>>
  onAfter: (world: TestEnvironmentWorld<INTERACTORS>) => Promise<void>
  onFailure: (world: TestEnvironmentWorld<INTERACTORS>, testName: string) => Promise<ReportEntry[]>
  createWorld: () => TestEnvironmentWorld<INTERACTORS>
}

type DefaultConfig = { hook?: 'before-all' | 'before' }
type RunnerConfig = { type: 'runner'; creator: () => Runner } & DefaultConfig
type InteractorConfig = { type: 'interactor'; creator: () => Interactor } & DefaultConfig

type RunnerInstance = { instance: Runner } & DefaultConfig
type InteractorInstance = { instance: Interactor } & DefaultConfig

type FilterInteractorConfig<SERVICES extends Record<string, RunnerConfig | InteractorConfig>> = {
  [K in keyof SERVICES]: SERVICES[K] extends InteractorConfig ? SERVICES[K] : never
}

export const createTestEnvironment = <
  SERVICES extends Record<string, RunnerConfig | InteractorConfig>,
>(
  services: SERVICES,
): TestEnviornment<ServicesToNamedInteractor<FilterInteractorConfig<SERVICES>>> => {
  type Interactor = ServicesToNamedInteractor<FilterInteractorConfig<SERVICES>>

  const isInteractorEntry = (
    entry: [string, RunnerConfig | InteractorConfig],
  ): entry is [string, InteractorConfig] => entry[1].type === 'interactor'

  const isRunnerEntry = (
    entry: [string, RunnerConfig | InteractorConfig],
  ): entry is [string, RunnerConfig] => entry[1].type === 'runner'

  const interactorsInstances = new Map(
    Object.entries(services)
      .filter(isInteractorEntry)
      .map(([key, { creator, hook }]) => [
        key,
        { instance: creator(), ...(Boolean(hook) && { hook }) },
      ]),
  )

  const runnersInstances = new Map(
    Object.entries(services)
      .filter(isRunnerEntry)
      .map(([key, { creator, hook }]) => [
        key,
        { instance: creator(), ...(Boolean(hook) && { hook }) },
      ]),
  )

  const asyncTransform = async <T, R>(
    iterable: Iterable<T>,
    transform: (list: T[]) => Array<Promise<R>>,
  ): Promise<R[]> => await Promise.all(transform([...iterable]))

  const forEachRunner = async (
    mapper: (runner: RunnerInstance) => Promise<void>,
  ): Promise<void> => {
    await asyncTransform(runnersInstances.values(), (list) => list.map(mapper))
  }

  const forEachBeforeAllInteractor = async (
    mapper: (interactor: InteractorInstance) => Promise<void>,
  ): Promise<void> => {
    await asyncTransform(interactorsInstances.values(), (list) =>
      list.filter(({ hook }) => hook === 'before-all').map(mapper),
    )
  }

  const forEachBeforeInteractor = async (
    mapper: (interactor: InteractorInstance) => Promise<void>,
  ): Promise<void> => {
    await asyncTransform(interactorsInstances.values(), (list) =>
      list.filter(({ hook }) => hook === 'before').map(mapper),
    )
  }

  const mapInteractors = async <T>(
    mapper: (key: Interactor['name'], interactor: InteractorInstance) => Promise<T>,
  ): Promise<T[]> =>
    await asyncTransform(interactorsInstances.entries(), (list) =>
      list.map(async ([key, interactor]) => await mapper(key, interactor)),
    )

  return {
    onBeforeAll: async () => {
      await forEachRunner(async ({ instance }) => {
        await instance.start()
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
      await forEachBeforeInteractor(async ({ instance }) => {
        await instance.stop()
      })
    },
    onFailure: async (world, testName) => {
      return await mapInteractors(async (name, { instance }) => {
        return await instance.onFailure(world.get(name), testName)
      })
    },
    createWorld: () => createWorld<Interactor>(),
  }
}
