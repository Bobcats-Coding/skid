import { RawKeyValueStore } from '../type'

export const createMemoryRawKeyValueStore: () => RawKeyValueStore = () => {
  return new Map()
}
