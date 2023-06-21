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

export type ServiceConfig = InteractorConfig | RunnerConfig

export type TestEnviornmentConfig = Record<string, ServiceConfig>

export type ServicesToNamedInstance<
  SERVICES extends Record<string, ServiceConfig>,
  KEY = keyof SERVICES,
> = KEY extends string
  ? KEY extends keyof SERVICES
    ? NamedInstance<KEY, ReturnType<SERVICES[KEY]['creator']>>
    : never
  : never

export type GetContextByName<
  INTERACTORS extends NamedInstance,
  NAME extends string,
> = INTERACTORS extends NamedInstance<NAME, infer C>
  ? C extends Interactor
    ? GetContext<C>
    : never
  : never

export type GetContext<INTERACTOR extends Interactor> = INTERACTOR extends Interactor<infer CONTEXT>
  ? CONTEXT
  : never

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

export type FilterConfigByType<
  SERVICES extends Record<string, ServiceConfig>,
  TYPE extends RunnerConfig | InteractorConfig,
> = {
  [K in keyof SERVICES]: SERVICES[K] extends TYPE ? SERVICES[K] : never
}

export type TestEnviornmentState<
  SERVICES extends Record<string, ServiceConfig>,
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
