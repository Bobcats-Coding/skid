import type { GetAllPaths, GetValueByPath } from '@bobcats-coding/skid/core/type'
import { split } from '@bobcats-coding/skid/core/util'
import { getSchemaByObjectPath, GetSchemaType } from '@bobcats-coding/skid/core/zod'

import type { ZodSchema } from 'zod'

export type RawKeyValueStore = {
  get: (key: string) => unknown
}

type Schemas = Record<string, ZodSchema>

export type KeyValueStoreDeep<SCHEMAS extends Schemas, FULL_OBJECT = SchemaRecordToObj<SCHEMAS>> = {
  get: <KEY extends GetAllPaths<FULL_OBJECT> & string>(key: KEY) => GetValueByPath<FULL_OBJECT, KEY>
  validate: () => void
}

type SchemaRecordToObj<SCHEMAS extends Schemas> = {
  [K in keyof SCHEMAS]: GetSchemaType<SCHEMAS[K]>
}

export const createKeyValueStoreDeep = <SCHEMAS extends Schemas>(
  rawStore: RawKeyValueStore,
  validators: SCHEMAS,
): KeyValueStoreDeep<SCHEMAS> => {
  const getValidator = (key: string): ZodSchema<any> => {
    const [firstKey, ...restKeys] = split(key, '.')
    const schema = validators[firstKey]
    if (schema === undefined) {
      throw Error()
    }
    // Without the `as any` it is an infinite loop for typecheking
    return getSchemaByObjectPath(schema as any, restKeys.join('.') as any)
  }

  const getRawValue = (key: string): unknown => {
    try {
      return rawStore.get(key)
    } catch (e) {
      throw new Error(`Key is not present in store: "${key}"`, {
        cause: e,
      })
    }
  }

  const get: KeyValueStoreDeep<SCHEMAS>['get'] = (key) => {
    const rawValue = getRawValue(key)
    const validator = getValidator(key)
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
