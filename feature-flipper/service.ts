import type { FeatureFlipperConfiguration } from './type'
import { createEnvVarRawKeyValueStore } from '../key-value-stores/raw-stores/env-var'

export type FeatureFlipperService<ENV_VARS> = {
  isEnabled: (name: ENV_VARS) => boolean
}

export const createFeatureFlipperService = <const T extends readonly FeatureFlipperConfiguration[]>(featureFlippers: T): FeatureFlipperService<T[number]['name']> => {

  const isEnabled = (envVar: string): boolean => {
    const formattedEnvVar = `FF_${envVar.toUpperCase()}`
    const store = createEnvVarRawKeyValueStore()
    const processEnv = store.get(formattedEnvVar)
    return processEnv !== undefined
      ? processEnv === 'true'
      : featureFlippers.find(ff => ff.name === envVar)?.value ?? false
  }

  return {
    isEnabled,
  }
}
