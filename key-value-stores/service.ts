import {
  isWritableRawKeyValueStore,
  type RawKeyValueStore,
  type Schemas,
  type WriteableRawKeyValueStore,
} from './type'

import type {
  EntryTuple,
  GetKey,
  GetValueByKey,
  RecordToEntries,
} from '@bobcats-coding/skid/core/type'
import type { GetSchemaType } from '@bobcats-coding/skid/core/zod'

import { type ZodSchema } from 'zod'

export type KeyValueStore<
  SCHEMAS extends Schemas,
  RAW_STORE extends RawKeyValueStore = RawKeyValueStore,
  SCHEMA_ENTRIES extends EntryTuple = RecordToEntries<SCHEMAS>,
  READABLE = {
    get: <KEY extends GetKey<SCHEMA_ENTRIES>>(
      key: KEY,
    ) => GetSchemaType<GetValueByKey<SCHEMA_ENTRIES, KEY>>
    validate: () => void
  },
  WRITABLE = {
    set: <KEY extends GetKey<SCHEMA_ENTRIES>>(
      key: KEY,
      value: GetSchemaType<GetValueByKey<SCHEMA_ENTRIES, KEY>>,
    ) => void
  },
> = RAW_STORE extends WriteableRawKeyValueStore<any> ? READABLE & WRITABLE : READABLE

export const createKeyValueStore = <SCHEMAS extends Schemas, RAW_STORE extends RawKeyValueStore>(
  rawStore: RAW_STORE,
  validators: SCHEMAS,
): KeyValueStore<SCHEMAS, RAW_STORE> => {
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

  const get: KeyValueStore<SCHEMAS, RAW_STORE>['get'] = (key) => {
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

  const set: KeyValueStore<SCHEMAS, WriteableRawKeyValueStore<any>>['set'] = (key, value) => {
    if (!isWritableRawKeyValueStore(rawStore)) {
      return
    }
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
    validate: () => {
      Object.keys(validators).forEach((key) => get(key))
    },
    ...(isWritableRawKeyValueStore(rawStore) ? { set } : {}),
  } as KeyValueStore<SCHEMAS, RAW_STORE>
}
