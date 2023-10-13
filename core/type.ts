export type StringLiteral<T> = T extends string ? (string extends T ? never : T) : never

export type ObjectWithStringLiteralKey<KEY, VALUE> = {
  [K in StringLiteral<KEY>]: VALUE
}

export type JsonType = number | string | boolean | null | JsonType[] | { [key: string]: JsonType }

export type TokenNonEmptyString<TOKEN extends string | number> = TOKEN extends '' ? never : TOKEN

export type Guard<T = any> = (arg: unknown) => arg is T

export type GetGuarded<GUARD extends Guard> = GUARD extends (arg: unknown) => arg is infer GUARDED
  ? GUARDED
  : never

export type EntryTuple<KEY extends string = string, VALUE = any> = [KEY, VALUE]

export type RecordToEntries<
  RECORD extends Record<string, any>,
  KEY = keyof RECORD,
> = KEY extends string ? (KEY extends keyof RECORD ? EntryTuple<KEY, RECORD[KEY]> : never) : never

export type GetValueByKey<
  ENTRIES extends EntryTuple,
  KEY extends string,
> = ENTRIES extends EntryTuple<KEY, infer ENTRY> ? ENTRY : never

export type GetKey<ENTRIES extends EntryTuple> = ENTRIES[0]

export type GetValue<ENTRIES extends EntryTuple> = ENTRIES[1]

export type FilterRecord<RECORD extends Record<string | number | symbol, any>, TYPE> = {
  [K in keyof RECORD]: RECORD[K] extends TYPE ? RECORD[K] : never
}
