import type { EntryTuple, FilterRecord, GetKey, GetValue, RecordToEntries } from '../core/type'

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

export type InstanceEntry<
  NAME extends string = string,
  INSTANCE extends Interactor | Runner = Interactor | Runner,
> = EntryTuple<NAME, INSTANCE>

export type ConfigEntry<
  NAME extends string = string,
  CONFIG extends ServiceConfig = ServiceConfig,
> = EntryTuple<NAME, CONFIG>

export type ServiceConfig = InteractorConfig | RunnerConfig

export type TestEnviornmentConfig = Record<string, ServiceConfig>

export type GetInstance<CONFIG extends ServiceConfig> = ReturnType<CONFIG['creator']>

export type GetInstanceEntry<CONFIG extends ConfigEntry> =
  CONFIG extends ConfigEntry<infer N, infer C> ? InstanceEntry<N, GetInstance<C>> : never

export type GetContext<INTERACTOR extends Interactor | Runner> =
  INTERACTOR extends Interactor<infer CONTEXT> ? CONTEXT : never

export type ReportEntry =
  | {
      entry: string
      type: 'text/plain'
    }
  | {
      entry: Buffer
      type: 'image/png'
    }

export type DefaultConfig = { hook?: 'before-all' | 'before' }

export type RunnerConfig<RUNNER = any, ARGS extends any[] = any[]> = {
  type: 'runner'
  creator: (...args: ARGS) => RUNNER
} & DefaultConfig

export type InteractorConfig<INTERACTOR = any, ARGS extends any[] = any[]> = {
  type: 'interactor'
  creator: (...args: ARGS) => INTERACTOR
} & DefaultConfig

export type RunnerInstance = { instance: Runner } & DefaultConfig
export type InteractorInstance = { instance: Interactor } & DefaultConfig

export type TestEnviornmentState<
  SERVICES extends Record<string, ServiceConfig>,
  INTERACTORS extends InstanceEntry = GetInstanceEntry<
    RecordToEntries<FilterRecord<SERVICES, InteractorConfig>>
  >,
  RUNNERS extends InstanceEntry = GetInstanceEntry<
    RecordToEntries<FilterRecord<SERVICES, RunnerConfig>>
  >,
> = {
  serviceConfigs: SERVICES
  interactors: Map<GetKey<INTERACTORS>, { instance: GetValue<INTERACTORS> } & DefaultConfig>
  runners: Map<GetKey<RUNNERS>, { instance: GetValue<RUNNERS> } & DefaultConfig>
}
