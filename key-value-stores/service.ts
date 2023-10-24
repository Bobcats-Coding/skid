import type { KeyValueStoreWithValidator, RawKeyValueStore, Schemas } from './type'

import type {
  EntryTuple,
  GetKey,
  GetValueByKey,
  RecordToEntries,
} from '@bobcats-coding/skid/core/type'
import type { GetSchemaType } from '@bobcats-coding/skid/core/zod'

import { ZodSchema } from 'zod'

export type KeyValueStore<
  SCHEMAS extends Schemas,
  SCHEMA_ENTRIES extends EntryTuple = RecordToEntries<SCHEMAS>,
> = KeyValueStoreWithValidator<{
  get: <KEY extends GetKey<SCHEMA_ENTRIES>>(
    key: KEY,
  ) => GetSchemaType<GetValueByKey<SCHEMA_ENTRIES, KEY>>
  set: <KEY extends GetKey<SCHEMA_ENTRIES>>(
    key: KEY,
    valuse: GetSchemaType<GetValueByKey<SCHEMA_ENTRIES, KEY>>,
  ) => void
  validate: () => void
}>

export const createKeyValueStore = <SCHEMAS extends Schemas>(
  rawStore: RawKeyValueStore,
  validators: SCHEMAS,
): KeyValueStore<SCHEMAS> => {
  const getRawValue = (key: string): unknown => {
    try {
      return rawStore.get(key)
    } catch (e) {
      throw new Error(`Key is not present in store: "${key}"`, {
        cause: e,
      })
    }
  }

  const getValidator = (key: string): ZodSchema<any> => {
    const validator = validators[key]
    if (validator === undefined) {
      throw new Error(`Invalid key: "${key}"`)
    }
    return validator
  }

  const get: KeyValueStore<SCHEMAS>['get'] = (key) => {
    const validator = getValidator(key)
    const rawValue = getRawValue(key)
    try {
      return validator.parse(rawValue)
    } catch (e) {
      throw new Error(`Invalid type in store: "${key}" => ${JSON.stringify(rawValue)}`, {
        cause: e,
      })
    }
  }

  const set: KeyValueStore<SCHEMAS>['set'] = (key, value) => {
    const validator = getValidator(key)
    try {
      rawStore.set(key, validator.parse(value))
    } catch (e) {
      throw new Error(`Invalid value type for key: "${key}" => ${JSON.stringify(value)}`, {
        cause: e,
      })
    }
  }

  return {
    get,
    set,
    validate: () => {
      Object.keys(validators).forEach((key) => get(key))
    },
  }
}
