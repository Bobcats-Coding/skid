import { type WriteableRawKeyValueStore } from '../type'

export const createMemoryRawKeyValueStore = <T = unknown>(): WriteableRawKeyValueStore<T> => {
  return new Map()
}
