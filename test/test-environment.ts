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

export type TestEnvironmentWorld<INTERACTORS extends Record<string, Interactor>> = {
  get: (name: keyof INTERACTORS) => GetContext<INTERACTORS[typeof name]>
  register: (name: keyof INTERACTORS, context: GetContext<INTERACTORS[typeof name]>) => void
}

type GetContext<INTERACTOR extends Interactor> = INTERACTOR extends Interactor<infer CONTEXT>
  ? CONTEXT
  : never

export const createWorld = <
  INTERACTORS extends Record<string, Interactor>,
>(): TestEnvironmentWorld<INTERACTORS> => {
  const interactors: Map<keyof INTERACTORS, GetContext<INTERACTORS[keyof INTERACTORS]>> = new Map()

  return {
    get: (name: keyof INTERACTORS) => {
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

export type TestEnviornment<INTERACTORS extends Record<string, Interactor>> = {
  onBeforeAll: () => Promise<void>
  onAfterAll: () => Promise<void>
  onBefore: (world: TestEnvironmentWorld<INTERACTORS>) => Promise<Observable<ReportEntry>>
  onAfter: (world: TestEnvironmentWorld<INTERACTORS>) => Promise<void>
  onFailure: (world: TestEnvironmentWorld<INTERACTORS>, testName: string) => Promise<ReportEntry[]>
}

export const createTestEnvironment = <
  INTERACTORS extends Record<string, Interactor>,
  RUNNERS extends Record<string, Runner>,
>({
  interactors,
  runners,
}: {
  interactors: Record<keyof INTERACTORS, () => INTERACTORS[keyof INTERACTORS]>
  runners: Record<keyof RUNNERS, () => RUNNERS[keyof RUNNERS]>
}): TestEnviornment<INTERACTORS> => {
  type INTERACTOR = INTERACTORS[keyof INTERACTORS]
  const interactorsInstances = new Map<keyof INTERACTORS, INTERACTOR>(
    Object.entries(interactors).map(([name, interactor]) => [name, interactor()]),
  )
  const runnersInstances = new Map(
    Object.entries(runners).map(([name, runner]) => [name, runner()]),
  )

  const asyncMap = async <T, R>(
    iterable: Iterable<T>,
    mapper: (arg: T) => Promise<R>,
  ): Promise<R[]> => await Promise.all([...iterable].map(mapper))

  const forEachRunner = async (mapper: (runner: Runner) => Promise<void>): Promise<void> => {
    await asyncMap(runnersInstances.values(), mapper)
  }

  const forEachInteractor = async (
    mapper: (interactor: INTERACTOR) => Promise<void>,
  ): Promise<void> => {
    await asyncMap(interactorsInstances.values(), mapper)
  }

  const mapInteractors = async <T>(
    mapper: (key: keyof INTERACTORS, interactor: INTERACTOR) => Promise<T>,
  ): Promise<T[]> =>
    await asyncMap(
      interactorsInstances.entries(),
      async ([key, interactor]) => await mapper(key, interactor),
    )

  return {
    onBeforeAll: async () => {
      await forEachRunner(async (runner) => {
        await runner.start()
      })
      await forEachInteractor(async (interactor) => {
        await interactor.start()
      })
    },
    onAfterAll: async () => {
      await forEachRunner(async (runner) => {
        await runner.stop()
      })
      await forEachInteractor(async (interactor) => {
        await interactor.stop()
      })
    },
    onBefore: async (world) => {
      const reportEntries = await mapInteractors(async (name, interactor) => {
        const { context, reportEntry$ } = await interactor.startContext()
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
      await mapInteractors(async (name, interactor) => {
        await interactor.stopContext(world.get(name))
      })
    },
    onFailure: async (world, testName) => {
      return await mapInteractors(async (name, interactor) => {
        return await interactor.onFailure(world.get(name), testName)
      })
    },
  }
}
