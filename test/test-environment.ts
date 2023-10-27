import type { FilterRecord, GetKey, GetValue, RecordToEntries } from '../core/type'
import type {
  DefaultConfig,
  GetInstanceEntry,
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
import { map, merge, ReplaySubject } from 'rxjs'

export type TestEnviornment<SERVICES extends Record<string, ServiceConfig>> = {
  onBeforeAll: () => Promise<Observable<ReportEntry>>
  onAfterAll: () => Promise<Observable<ReportEntry>>
  onBefore: (world: TestEnvironmentWorld<SERVICES>) => Promise<Observable<ReportEntry>>
  onAfter: (world: TestEnvironmentWorld<SERVICES>) => Promise<Observable<ReportEntry>>
  onFailure: (world: TestEnvironmentWorld<SERVICES>, testName: string) => Promise<ReportEntry[]>
  createWorld: () => TestEnvironmentWorld<SERVICES>
}

export const createTestEnvironment = <const SERVICES extends Record<string, ServiceConfig>>(
  services: SERVICES,
): TestEnviornment<SERVICES> => {
  type Interactor = GetInstanceEntry<RecordToEntries<FilterRecord<SERVICES, InteractorConfig>>>
  type Runner = GetInstanceEntry<RecordToEntries<FilterRecord<SERVICES, RunnerConfig>>>

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

  const isBeforeAll = ({ hook }: DefaultConfig): boolean => hook === 'before-all'
  const isNotBeforeAll = ({ hook }: DefaultConfig): boolean => hook !== 'before-all'
  const isBefore = ({ hook }: DefaultConfig): boolean => hook === 'before'
  const keyValueToObject = <T>([name, service]: [string, T]): T & { name: string } => ({
    name,
    ...service,
  })

  const asyncTransform = async <T, R>(
    iterable: Iterable<T>,
    transform: (list: T[]) => Array<Promise<R>>,
  ): Promise<R[]> => await Promise.all(transform([...iterable]))

  const forEachBeforeAllService = async (
    mapper: (runner: { name: GetKey<Interactor> } & RunnerInstance) => Promise<void>,
  ): Promise<void> => {
    await asyncTransform([...state.runners.entries(), ...state.interactors.entries()], (list) =>
      list.map(keyValueToObject).filter(isBeforeAll).map(mapper),
    )
  }

  const forEachScenarioService = async (
    mapper: (interactor: { name: GetKey<Interactor> } & InteractorInstance) => Promise<void>,
  ): Promise<void> => {
    await asyncTransform([...state.interactors.entries(), ...state.runners.entries()], (list) =>
      list.map(keyValueToObject).filter(isNotBeforeAll).map(mapper),
    )
  }

  const forEachBeforeInteractor = async (
    mapper: (interactor: InteractorInstance) => Promise<void>,
  ): Promise<void> => {
    await asyncTransform(state.interactors.values(), (list) => list.filter(isBefore).map(mapper))
  }

  const mapInteractors = async <T>(
    mapper: (interactor: { name: GetKey<Interactor> } & InteractorInstance) => Promise<T>,
  ): Promise<T[]> =>
    await asyncTransform(state.interactors.entries(), (list) =>
      list.map(async ([name, interactor]) => await mapper({ name, ...interactor })),
    )

  return {
    onBeforeAll: async () => {
      const entries$ = new ReplaySubject<ReportEntry>()
      await forEachBeforeAllService(async ({ instance, name }) => {
        await instance.start()
        const message = `${name}: Started in before-all`
        entries$.next({ entry: message, type: 'text/plain' })
        console.log(message)
      })
      return entries$.asObservable()
    },
    onAfterAll: async () => {
      const entries$ = new ReplaySubject<ReportEntry>()
      await forEachBeforeAllService(async ({ instance, name }) => {
        await instance.stop()
        const message = `${name}: Stopped in after-all`
        entries$.next({ entry: message, type: 'text/plain' })
        console.log(message)
      })
      return entries$.asObservable()
    },
    onBefore: async (world) => {
      await forEachBeforeInteractor(async ({ instance }) => {
        await instance.start()
      })
      const reportEntries = await mapInteractors(async ({ name, instance }) => {
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
      const entries$ = new ReplaySubject<ReportEntry>()
      await mapInteractors(async ({ name, instance }) => {
        await instance.stopContext(world.get(name))
      })
      await forEachScenarioService(async ({ instance, name }) => {
        await instance.stop()
        const message = `${name}: Stopped in after`
        entries$.next({ entry: message, type: 'text/plain' })
        console.log(message)
      })
      return entries$.asObservable()
    },
    onFailure: async (world, testName) => {
      return await mapInteractors(async ({ name, instance }) => {
        return await instance.onFailure(world.get(name), testName)
      })
    },
    createWorld: () => createWorld<SERVICES>(state),
  }
}
