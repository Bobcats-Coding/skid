import { createMemoryRawKeyValueStore } from '../key-value-stores/raw-stores/memory'
import { createTransformedStore } from '../key-value-stores/service-transform'
import type { ReadableRawKeyValueStore } from '../key-value-stores/type'
import { getIdentityValue } from './identity'
import type { FeatureFlipperConfiguration } from './type'

type FeatureFlipperName<T extends readonly FeatureFlipperConfiguration[]> = T[number]['name']

type ConfigToArray<ARRAY extends readonly FeatureFlipperConfiguration[]> = ARRAY[number]

type GetIdentity<CONFIG extends FeatureFlipperConfiguration, NAME extends string> = CONFIG extends {
  name: NAME
  identity: infer Identity
}
  ? Identity
  : never

type FFConfig<T extends readonly FeatureFlipperConfiguration[]> = ConfigToArray<T>

type Identity<
  T extends readonly FeatureFlipperConfiguration[],
  NAME extends FeatureFlipperName<T>,
> =
  GetIdentity<FFConfig<T>, NAME> extends undefined
    ? never
    : Partial<Record<keyof GetIdentity<FFConfig<T>, NAME>, string>>

export type FeatureFlipperService<T extends readonly FeatureFlipperConfiguration[]> = {
  isEnabled: <NAME extends FeatureFlipperName<T>>(
    name: NAME,
    identity?: Identity<T, NAME>,
  ) => boolean
  setOverride: (name: FeatureFlipperName<T>, value: boolean) => void
  isFeatureFlipperName: (name: string) => name is FeatureFlipperName<T>
}

export type FeatureFlipperServiceByNames<NAMES extends string[]> = Omit<
  FeatureFlipperService<{
    [K in keyof NAMES]: NAMES[K] extends string ? { name: NAMES[K]; value: boolean } : never
  }>,
  'isFeatureFlipperName'
>

export const createFeatureFlipperService = <
  const CONFIG extends readonly FeatureFlipperConfiguration[],
>(
  featureFlippers: CONFIG,
  envVarStore: ReadableRawKeyValueStore<string | undefined>,
): FeatureFlipperService<CONFIG> => {
  const transformEnvVarKeyValue = (
    key: string,
    store: ReadableRawKeyValueStore,
  ): boolean | undefined => {
    const prefixProcess = 'FF_'
    const prefixVite = 'PUBLIC_FF_'
    const formattedNameProcessEnv = `${prefixProcess + key.toUpperCase()}`
    const formattedNameImportMetaEnv = `${prefixVite + key.toUpperCase()}`
    const envVarProcess = store.get(formattedNameProcessEnv)
    const envVarImportMeta = store.get(formattedNameImportMetaEnv)
    const envVarValue = envVarProcess ?? envVarImportMeta
    return envVarValue !== undefined ? envVarValue === 'true' : undefined
  }

  const transformedEnvVarStore = createTransformedStore(envVarStore, transformEnvVarKeyValue)
  const overrideStore = createMemoryRawKeyValueStore<boolean>()
  const identityStore = createMemoryRawKeyValueStore<boolean | undefined>()
  const stores = [identityStore, overrideStore, transformedEnvVarStore]

  const getFeatureFlipperFromConfig = (name: string): FeatureFlipperConfiguration | undefined => {
    return featureFlippers.find((ff) => ff.name === name)
  }

  const isEnabled = (name: string, identity?: Partial<Record<string, string>>): boolean => {
    const feature = getFeatureFlipperFromConfig(name)

    if (feature !== undefined && identity !== undefined) {
      identityStore.set(name, getIdentityValue(feature, identity))
    }

    const value = stores.map((store) => store.get(name)).find((val) => val !== undefined)
    return value ?? feature?.value ?? false
  }

  const setOverride = (name: string, value: boolean): void => {
    if (isEnabled('url_override')) {
      overrideStore.set(name, value)
    }
  }

  const isFeatureFlipperName = (name: string): name is FeatureFlipperName<CONFIG> => {
    return getFeatureFlipperFromConfig(name) !== undefined
  }

  return {
    isEnabled,
    setOverride,
    isFeatureFlipperName,
  }
}
