import type { ReadableRawKeyValueStore, WriteableRawKeyValueStore } from '../type'

export const createProcessEnvVarRawKeyValueStore = (): WriteableRawKeyValueStore<
  string | undefined
> => {
  return {
    get: (key) => process.env[key],
    set: (key, value) => {
      process.env[key] = value
    },
  }
}

export const createImportMetaEnvVarRawKeyValueStore = (): ReadableRawKeyValueStore<
  string | undefined
> => {
  return {
    get: (key) => {
      return import.meta.env[key]
    },
  }
}
