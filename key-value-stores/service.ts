import { type ZodSchema } from 'zod'

export type RawKeyValueStore = {
  get: (key: string) => unknown
}

export type KeyValueStore<
  SCHEMAS extends Record<string, ZodSchema>,
  KEY_SCHEMAS extends KeySchema = GetKeySchemas<SCHEMAS>,
> = {
  get: <KEY extends KEY_SCHEMAS['key']>(key: KEY) => GetSchemaTypeByKey<KEY_SCHEMAS, KEY>
  validate: () => void
}

type KeySchema<KEY extends string = string, SCHEMA extends ZodSchema = ZodSchema> = {
  key: KEY
  schema: SCHEMA
}

type GetKeySchemas<
  SCHEMAS extends Record<string, ZodSchema>,
  KEY = keyof SCHEMAS,
> = KEY extends string ? (KEY extends keyof SCHEMAS ? KeySchema<KEY, SCHEMAS[KEY]> : never) : never

type GetSchemaType<SCHEMA = ZodSchema> = SCHEMA extends ZodSchema<infer TYPE> ? TYPE : never

type GetSchemaTypeByKey<
  KEY_SCHEMAS extends KeySchema,
  KEY extends string,
> = KEY_SCHEMAS extends KeySchema<KEY, infer SCHEMA> ? GetSchemaType<SCHEMA> : never

export const createKeyValueStore = <SCHEMAS extends Record<string, ZodSchema>>(
  rawStore: RawKeyValueStore,
  validators: SCHEMAS,
): KeyValueStore<SCHEMAS> => {
  const get: KeyValueStore<SCHEMAS>['get'] = (key) => {
    const rawValue = rawStore.get(key)
    const validator = validators[key]
    if (validator === undefined) {
      throw new Error()
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
