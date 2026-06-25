import { type JsonType } from './type'
import {
  assertDefined,
  findByPattern,
  type GetValueFromPatternList,
  type OptionalPatternList,
  optionalPatternToList,
  type OptionalPatternToList,
} from './util'

export type Application<
  CONFIG extends Partial<ApplicationTypeConfig> = DefaultApplicationTypeConfig,
> = {
  run: (
    identity?: CONFIG['identity'],
    overrides?: Partial<SingleApplicationArgs<ApplicationTypeConfigWithDefaults<CONFIG>>>,
  ) => ApplicationRunReturn<CONFIG>
  getArgs: () => Array<Partial<CreateApplicationArgs<CONFIG>>>
}

export const createApplication = <
  const CONFIG extends Partial<ApplicationTypeConfig> = DefaultApplicationTypeConfig,
>(
  appArgs: Partial<CreateApplicationArgs<ApplicationTypeConfigWithDefaults<CONFIG>>> = {},
  otherApp?: () => Application<ApplicationTypeConfigWithDefaults<CONFIG>>,
): Application<ApplicationTypeConfigWithDefaults<CONFIG>> => {
  type AppArgs = CreateApplicationArgs<ApplicationTypeConfigWithDefaults<CONFIG>>
  const DEFAULTS = {
    getExternalServices: () => ({}),
    getInternalServices: () => ({}),
    preMain: () => {},
    getDelivery: () => ({}),
    main: () => {},
    onError: () => {},
    topLevelErrorHandling: () => {},
    exportState: () => {},
    importState: () => {},
  } as const

  const toPatternLists = <const T extends Record<string, any>>(
    defaults: T,
  ): {
    [K in keyof T]: OptionalPatternToList<T[K]>
  } =>
    Object.fromEntries(
      Object.entries(defaults).map(([key, value]) => {
        return [key, optionalPatternToList(value)]
      }),
    ) as { [K in keyof T]: OptionalPatternToList<T[K]> }

  const getArg = <KEY extends keyof AppArgs, PATTERN_LISTS extends Record<string, any>>(
    patternLists: PATTERN_LISTS,
    key: KEY,
    runIdentity: CONFIG['identity'],
  ): GetValueFromPatternList<PATTERN_LISTS[KEY]> => {
    const arg = findByPattern(patternLists[key], runIdentity as JsonType)
    return assertDefined(arg, `No matching identity for "${key}"`)
  }

  const getDefaultedArgs = <const PATTERN_LISTS extends Record<string, OptionalPatternToList<any>>>(
    patternLists: PATTERN_LISTS,
    identity: CONFIG['identity'],
  ): {
    [K in keyof PATTERN_LISTS]: GetValueFromPatternList<PATTERN_LISTS[K]>
  } =>
    Object.fromEntries(
      Object.entries(patternLists).map(([key]) => {
        return [key, getArg(patternLists, key as keyof AppArgs, identity)]
      }),
    ) as { [K in keyof PATTERN_LISTS]: GetValueFromPatternList<PATTERN_LISTS[K]> }

  const registerArg = <KEY extends keyof AppArgs, C extends Record<string, any>>(
    config: C,
    key: KEY,
    argPatternLists: ArgPatternList<CONFIG>,
  ): void => {
    if (config[key] !== undefined) {
      const oldArgPatterns = argPatternLists[key]
      argPatternLists[key] = [
        ...argPatternLists[key],
        ...optionalPatternToList(config[key]),
      ] as typeof oldArgPatterns
    }
  }

  const register = (
    config: Partial<CreateApplicationArgs<ApplicationTypeConfigWithDefaults<CONFIG>>>,
    argPatternLists: ArgPatternList<CONFIG>,
  ): ArgPatternList<CONFIG> => {
    Object.keys(argPatternLists).forEach((argName) => {
      registerArg(config, argName as keyof AppArgs, argPatternLists)
    })
    return argPatternLists
  }

  const app: Application<ApplicationTypeConfigWithDefaults<CONFIG>> = {
    run: (runIdentity, overrides = {}) => {
      const [baseArg, ...restArgs] = app.getArgs()
      const firstArgsWithDefaults = {
        ...DEFAULTS,
        ...baseArg,
      } as const
      const argPatternLists = restArgs.reduce(
        (list, config) => register(config, list),
        toPatternLists(firstArgsWithDefaults),
      )
      const {
        getExternalServices,
        getInternalServices,
        preMain,
        getDelivery,
        main,
        onError,
        topLevelErrorHandling,
        exportState: exportStateOriginal,
        importState,
      } = {
        ...getDefaultedArgs(argPatternLists, runIdentity),
        ...overrides,
      }
      try {
        topLevelErrorHandling(onError)
        const externalServices = getExternalServices(runIdentity)
        const internalServices = getInternalServices(externalServices, runIdentity)
        preMain(internalServices, runIdentity)
        const exportState = (): CONFIG['exportState'] => exportStateOriginal(internalServices)
        const delivery = getDelivery({ internalServices, exportState }, runIdentity)
        const output = main({ delivery, internalServices }, runIdentity)
        return {
          externalServices,
          internalServices,
          delivery,
          output,
          exportState,
          importState: (newState) => {
            importState(internalServices, newState)
          },
        }
      } catch (e) {
        onError(e)
        throw new Error('Could not run application', { cause: e })
      }
    },
    getArgs: () => {
      return (otherApp !== undefined ? [...otherApp().getArgs(), appArgs] : [appArgs]) as Array<
        Partial<CreateApplicationArgs<ApplicationTypeConfigWithDefaults<CONFIG>>>
      >
    },
  }
  return app
}

export type SingleApplicationArgs<CONFIG extends Partial<ApplicationTypeConfig>> = {
  getExternalServices: GetExternalServices<CONFIG>
  getInternalServices: GetInternalServices<CONFIG>
  preMain: PreMain<CONFIG>
  getDelivery: GetDelivery<CONFIG>
  main: Main<CONFIG>
  onError: OnError
  topLevelErrorHandling: TopLevelErrorHandling
  exportState: ExportState<CONFIG>
  importState: ImportState<CONFIG>
}

export type CreateApplicationArgs<CONFIG extends Partial<ApplicationTypeConfig>> = {
  [KEY in keyof SingleApplicationArgs<CONFIG>]: OptionalPatternList<
    SingleApplicationArgs<CONFIG>[KEY],
    CONFIG['identity']
  >
}

export type ApplicationTypeConfig = {
  externalServices: Record<string, any>
  internalServices: Record<string, any>
  delivery: Record<string, any>
  output: any
  identity: any
  exportState: any
}

type DefaultApplicationTypeConfig = {
  externalServices: Record<string, never>
  internalServices: Record<string, never>
  delivery: Record<string, never>
  output: undefined
  identity: undefined
  exportState: undefined
}

type GetExternalServices<CONFIG extends Partial<ApplicationTypeConfig>> = (
  identity: CONFIG['identity'],
) => CONFIG['externalServices']

type GetInternalServices<CONFIG extends Partial<ApplicationTypeConfig>> = (
  externalServices: CONFIG['externalServices'],
  identity: CONFIG['identity'],
) => CONFIG['internalServices']

type PreMain<CONFIG extends Partial<ApplicationTypeConfig>> = (
  internalServices: CONFIG['internalServices'],
  identity: CONFIG['identity'],
) => void

type GetDelivery<CONFIG extends Partial<ApplicationTypeConfig>> = (
  injected: {
    internalServices: CONFIG['internalServices']
    exportState: () => CONFIG['exportState']
  },
  identity: CONFIG['identity'],
) => CONFIG['delivery']

type Main<CONFIG extends Partial<ApplicationTypeConfig>> = (
  injected: { internalServices: CONFIG['internalServices']; delivery: CONFIG['delivery'] },
  identity: CONFIG['identity'],
) => CONFIG['output']

type OnError = (error: unknown) => void

type TopLevelErrorHandling = (onError: (error: unknown) => void) => void

type ExportState<CONFIG extends Partial<ApplicationTypeConfig>> = (
  internalServices: CONFIG['internalServices'],
) => CONFIG['exportState']

type ImportState<CONFIG extends Partial<ApplicationTypeConfig>> = (
  internalServices: CONFIG['internalServices'],
  newState: CONFIG['exportState'],
) => void

type ApplicationTypeConfigWithDefaults<CONFIG extends Partial<ApplicationTypeConfig>> = {
  [KEY in keyof DefaultApplicationTypeConfig]: CONFIG[KEY] extends ApplicationTypeConfig[KEY]
    ? CONFIG[KEY]
    : DefaultApplicationTypeConfig[KEY]
}

export type ApplicationTypeConfigWithAnys<CONFIG extends Partial<ApplicationTypeConfig>> = {
  [KEY in keyof ApplicationTypeConfig]: CONFIG[KEY] extends ApplicationTypeConfig[KEY]
    ? CONFIG[KEY]
    : ApplicationTypeConfig[KEY]
}

type ArgPatternList<
  CONFIG extends Partial<ApplicationTypeConfig>,
  ARGS = CreateApplicationArgs<ApplicationTypeConfigWithDefaults<CONFIG>>,
> = { [KEY in keyof ARGS]: OptionalPatternToList<ARGS[KEY]> }

export type ApplicationRunReturn<CONFIG extends Partial<ApplicationTypeConfig>> = {
  externalServices: CONFIG['externalServices']
  internalServices: CONFIG['internalServices']
  delivery: CONFIG['delivery']
  output: CONFIG['output']
  importState: (newState: CONFIG['exportState']) => void
  exportState: () => CONFIG['exportState']
}
