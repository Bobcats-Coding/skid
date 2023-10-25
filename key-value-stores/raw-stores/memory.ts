import { type WriteableRawKeyValueStore } from '../type'

export const createMemoryRawKeyValueStore = (): WriteableRawKeyValueStore => {
  return new Map()
}
