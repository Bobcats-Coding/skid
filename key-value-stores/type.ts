import { ZodSchema } from 'zod'

export type KeyValueStoreCommon<STORE extends KeyValueStoreCommon_> = STORE

export type KeyValueStoreWithValidator<STORE extends KeyValueStoreWithValidator_> = STORE

type KeyValueStoreCommon_ = {
  get: (key: any) => any
  set: (ley: any, value: any) => void
}

type KeyValueStoreWithValidator_ = KeyValueStoreCommon_ & { validate: () => void }

export type RawKeyValueStore = KeyValueStoreCommon<{
  get: (key: string) => unknown
  set: (key: string, value: unknown) => void
}>

export type Schemas = Record<string, ZodSchema>
