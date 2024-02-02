import { type ZodSchema } from 'zod'

export type KeyValueStoreCommon<STORE extends KeyValueStoreCommon_> = STORE

export type KeyValueStoreWithValidator<STORE extends KeyValueStoreWithValidator_> = STORE

type KeyValueStoreCommon_ = {
  get: (key: any) => any
  set: (ley: any, value: any) => void
}

type KeyValueStoreWithValidator_ = KeyValueStoreCommon_ & { validate: () => void }

export type RawKeyValueStore<T = unknown> =
  | ReadableRawKeyValueStore<T>
  | WriteableRawKeyValueStore<T>

export type ReadableRawKeyValueStore<T = unknown> = {
  get: (key: string) => T
}

export type WriteableRawKeyValueStore<T = unknown> = {
  get: (key: string) => T
  set: (key: string, value: T) => void
}

export type Schemas = Record<string, ZodSchema>

export const isWritableRawKeyValueStore = (
  store: RawKeyValueStore,
): store is WriteableRawKeyValueStore => {
  return 'set' in store
}
