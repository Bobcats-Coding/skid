import type { WriteableRawKeyValueStore } from '../type'

export const createLocalStorageRawKeyValueStore = (): WriteableRawKeyValueStore<string> => {
  return {
    get: (key) => {
      return localStorage.getItem(key) ?? undefined
    },
    set: (key, value) => {
      localStorage.setItem(key, value)
    },
  }
}
