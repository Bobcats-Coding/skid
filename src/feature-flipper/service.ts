import type { ReadableRawKeyValueStore } from '../key-value-stores/type'
import type { FeatureFlipperConfiguration } from './type'

export type FeatureFlipperService<NAME> = {
  isEnabled: (name: NAME) => boolean
}

export const createFeatureFlipperService = <const T extends readonly FeatureFlipperConfiguration[]>(
  featureFlippers: T,
  store: ReadableRawKeyValueStore<string | undefined>,
): FeatureFlipperService<T[number]['name']> => {
  const isEnabled = (name: string): boolean => {
    const formattedNameProcessEnv = `FF_${name.toUpperCase()}`
    const formattedNameImportMetaEnv = `PUBLIC_FF_${name.toUpperCase()}`

    const envVarProcess = store.get(formattedNameProcessEnv)
    const envVarImportMeta = store.get(formattedNameImportMetaEnv)
    const envVar = envVarProcess ?? envVarImportMeta

    return envVar !== undefined
      ? envVar === 'true'
      : featureFlippers.find((ff) => ff.name === name)?.value ?? false
  }

  return {
    isEnabled,
  }
}
