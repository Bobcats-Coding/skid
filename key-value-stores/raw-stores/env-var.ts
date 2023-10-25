import type { WriteableRawKeyValueStore } from '../type'

export const createEnvVarRawKeyValueStore = (): WriteableRawKeyValueStore<string | undefined> => {
  return {
    get: (key) => process.env[key],
    set: (key, value) => {
      process.env[key] = value
    },
  }
}
