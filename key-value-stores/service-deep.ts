import {
  isWritableRawKeyValueStore,
  type RawKeyValueStore,
  type Schemas,
  type WriteableRawKeyValueStore,
} from './type'

import type { GetAllPaths, GetValueByPath } from '@bobcats-coding/skid/core/type'
import { split } from '@bobcats-coding/skid/core/util'
import { getSchemaByObjectPath, type GetSchemaType } from '@bobcats-coding/skid/core/zod'

import type { ZodSchema } from 'zod'

export type KeyValueStoreDeep<
  SCHEMAS extends Schemas,
  RAW_STORE extends RawKeyValueStore,
  FULL_OBJECT = SchemaRecordToObj<SCHEMAS>,
  READABLE = {
    get: <KEY extends GetAllPaths<FULL_OBJECT> & string>(
      key: KEY,
    ) => GetValueByPath<FULL_OBJECT, KEY>
    validate: () => void
  },
  WRITABLE = {
    set: <KEY extends GetAllPaths<FULL_OBJECT> & string>(
      key: KEY,
      value: GetValueByPath<FULL_OBJECT, KEY>,
    ) => void
  },
> = RAW_STORE extends WriteableRawKeyValueStore<any> ? READABLE & WRITABLE : READABLE

type SchemaRecordToObj<SCHEMAS extends Schemas> = {
  [K in keyof SCHEMAS]: GetSchemaType<SCHEMAS[K]>
}

export const createKeyValueStoreDeep = <
  SCHEMAS extends Schemas,
  RAW_STORE extends RawKeyValueStore,
>(
  rawStore: RAW_STORE,
  validators: SCHEMAS,
): KeyValueStoreDeep<SCHEMAS, RAW_STORE> => {
  const getValidator = (path: string): ZodSchema<any> => {
    const [firstKey, ...restKeys] = split(path, '.')
    const schema = validators[firstKey]
    try {
      // Without the `as any` it is an infinite loop for typecheking
      return getSchemaByObjectPath(schema as any, restKeys.join('.') as any)
    } catch (e) {
      throw new Error(`Invalid path: "${path}"`)
    }
  }

  const getRawValue = (path: string): unknown => {
    try {
      return rawStore.get(path)
    } catch (e) {
      throw new Error(`Path is not present in store: "${path}"`, {
        cause: e,
      })
    }
  }

  const get: KeyValueStoreDeep<SCHEMAS, RAW_STORE>['get'] = (path) => {
    const validator = getValidator(path)
    const rawValue = getRawValue(path)
    try {
      return validator.parse(rawValue)
    } catch (e) {
      throw new Error(`Invalid type in store: "${path}" => ${JSON.stringify(rawValue)}`, {
        cause: e,
      })
    }
  }

  const set: KeyValueStoreDeep<SCHEMAS, WriteableRawKeyValueStore>['set'] = (path, value) => {
    if (!isWritableRawKeyValueStore(rawStore)) {
      return
    }
    const validator = getValidator(path)
    try {
      rawStore.set(path, validator.parse(value))
    } catch (e) {
      throw new Error(`Invalid value type for path: "${path}" => ${JSON.stringify(value)}`, {
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
  } as unknown as KeyValueStoreDeep<SCHEMAS, RAW_STORE>
}
