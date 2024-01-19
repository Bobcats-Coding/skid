import type { ReadableRawKeyValueStore } from '../type'

export const createImportMetaEnvVarRawKeyValueStore = (): ReadableRawKeyValueStore<
  string | undefined
> => {
  return {
    get: (key) => {
      return import.meta.env[key]
    },
  }
}
