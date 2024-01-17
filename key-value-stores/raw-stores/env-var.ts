import type { WriteableRawKeyValueStore } from '../type'

export const createProcessEnvVarRawKeyValueStore = (): WriteableRawKeyValueStore<string | undefined> => {
  return {
    get: (key) => process.env[key],
    set: (key, value) => {
      process.env[key] = value
    },
  }
}

export const createImportMetaEnvVarRawKeyValueStore = (): WriteableRawKeyValueStore<string | undefined> => {
  console.log(import.meta.env)
  return {
    get: (key) => import.meta.env[key],
    set: (key, value) => {
      import.meta.env[key] = value
    },
  }
}
