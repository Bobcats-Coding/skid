import type {
  EntryTuple,
  GetKey,
  GetValueByKey,
  RecordToEntries,
} from '@bobcats-coding/skid/core/type'
import type { GetSchemaType } from '@bobcats-coding/skid/core/zod'

import type { ZodSchema } from 'zod'

export type RawKeyValueStore = {
  get: (key: string) => unknown
}

type Schemas = Record<string, ZodSchema>

export type KeyValueStore<
  SCHEMAS extends Schemas,
  SCHEMA_ENTRIES extends EntryTuple = RecordToEntries<SCHEMAS>,
> = {
  get: <KEY extends GetKey<SCHEMA_ENTRIES>>(
    key: KEY,
  ) => GetSchemaType<GetValueByKey<SCHEMA_ENTRIES, KEY>>
  validate: () => void
}

export const createKeyValueStore = <SCHEMAS extends Schemas>(
  rawStore: RawKeyValueStore,
  validators: SCHEMAS,
): KeyValueStore<SCHEMAS> => {
  const get: KeyValueStore<SCHEMAS>['get'] = (key) => {
    const rawValue = rawStore.get(key)
    const validator = validators[key]
    if (validator === undefined) {
      throw new Error('Key does not exist in schema')
    }
    try {
      return validator.parse(rawValue)
    } catch (e) {
      throw new Error(`Invalid type in store: "${key}" => ${JSON.stringify(rawValue)}`, {
        cause: e,
      })
    }
  }
  return {
    get,
    validate: () => {
      Object.keys(validators).forEach((key) => get(key))
    },
  }
}
