import type { FilterRecord, GetKey, GetValue, RecordToEntries } from '../core/type'
import type {
  DefaultConfig,
  GetInstance,
  InteractorConfig,
  InteractorInstance,
  ReportEntry,
  RunnerConfig,
  RunnerInstance,
  ServiceConfig,
  TestEnviornmentState,
} from './type'
import type { TestEnvironmentWorld } from './world'
import { createWorld } from './world'

import type { Observable } from 'rxjs'
import { map, merge } from 'rxjs'

export type TestEnviornment<SERVICES extends Record<string, ServiceConfig>> = {
  onBeforeAll: () => Promise<void>
  onAfterAll: () => Promise<void>
  onBefore: (world: TestEnvironmentWorld<SERVICES>) => Promise<Observable<ReportEntry>>
  onAfter: (world: TestEnvironmentWorld<SERVICES>) => Promise<void>
  onFailure: (world: TestEnvironmentWorld<SERVICES>, testName: string) => Promise<ReportEntry[]>
  createWorld: () => TestEnvironmentWorld<SERVICES>
}

export const createTestEnvironment = <SERVICES extends Record<string, ServiceConfig>>(
  services: SERVICES,
): TestEnviornment<SERVICES> => {
  type Interactor = GetInstance<RecordToEntries<FilterRecord<SERVICES, InteractorConfig>>>
  type Runner = GetInstance<RecordToEntries<FilterRecord<SERVICES, RunnerConfig>>>

  const isInteractorEntry = (entry: [string, ServiceConfig]): entry is [string, InteractorConfig] =>
    entry[1].type === 'interactor'

  const isRunnerEntry = (entry: [string, ServiceConfig]): entry is [string, RunnerConfig] =>
    entry[1].type === 'runner'

  const state: TestEnviornmentState<SERVICES> = {
    services,
    interactors: new Map<string, { instance: GetValue<Interactor> } & DefaultConfig>(
      Object.entries(services)
        .filter(isInteractorEntry)
        .map(([key, { creator, hook }]) => [
          key,
          { instance: creator(), ...(Boolean(hook) && { hook }) },
        ]),
    ),
    runners: new Map<string, { instance: GetValue<Runner> } & DefaultConfig>(
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

  const forEachBeforeAllRunner = async (
    mapper: (runner: RunnerInstance) => Promise<void>,
  ): Promise<void> => {
    await asyncTransform(state.runners.values(), (list) =>
      list.filter(({ hook }) => hook === 'before-all').map(mapper),
    )
  }

  const forEachScenarioInteractor = async (
    mapper: (interactor: InteractorInstance) => Promise<void>,
  ): Promise<void> => {
    await asyncTransform(state.interactors.values(), (list) =>
      list.filter(({ hook }) => hook !== 'before-all').map(mapper),
    )
  }

  const forEachBeforeInteractor = async (
    mapper: (interactor: InteractorInstance) => Promise<void>,
  ): Promise<void> => {
    await asyncTransform(state.interactors.values(), (list) =>
      list.filter(({ hook }) => hook === 'before').map(mapper),
    )
  }

  const mapInteractors = async <T>(
    mapper: (key: GetKey<Interactor>, interactor: InteractorInstance) => Promise<T>,
  ): Promise<T[]> =>
    await asyncTransform(state.interactors.entries(), (list) =>
      list.map(async ([key, interactor]) => await mapper(key, interactor)),
    )

  return {
    onBeforeAll: async () => {
      await forEachBeforeAllRunner(async ({ instance }) => {
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
      await forEachScenarioInteractor(async ({ instance }) => {
        await instance.stop()
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
