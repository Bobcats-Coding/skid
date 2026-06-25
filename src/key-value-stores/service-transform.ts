import type { ReadableRawKeyValueStore, TransformedStore, TransformKeyValueCallback } from './type'

export const createTransformedStore = <T>(
  store: ReadableRawKeyValueStore,
  transformKeyValue: TransformKeyValueCallback<T>,
): TransformedStore<T> => {
  return {
    get(key: string): T | undefined {
      const value = transformKeyValue(key, store)
      return value
    },
  }
}
