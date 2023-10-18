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

export type FilterRecord2<RECORD extends Record<string | number | symbol, any>, TYPE> = Pick<
  RECORD,
  {
    [K in keyof RECORD]: RECORD[K] extends TYPE ? K : never
  }[keyof RECORD]
>

export type FilterRecord<RECORD extends Record<string | number | symbol, any>, TYPE> = {
  [K in keyof RECORD]: RECORD[K] extends TYPE ? RECORD[K] : never
}

export type Split<STRING extends string, DELIMITER extends string> = SplitHelper<STRING, DELIMITER>

type SplitHelper<
  STRING extends string,
  DELIMITER extends string,
  ACC extends readonly string[] = [],
> = STRING extends `${infer FIRST}${DELIMITER}${infer REST}`
  ? SplitHelper<REST, DELIMITER, [...ACC, FIRST]>
  : readonly [...ACC, STRING]

export type SplitObjectPath<PATH extends string> = Split<PATH, '.'>

export type SplitFilePath<PATH extends string> = Split<PATH, '/'>

export type GetAllPaths<OBJECT, PATH extends string = ''> = PathsHelper<OBJECT, PATH, never>

type PathsHelper<OBJECT, PATH extends string, ACC> =
  | {
      [K in keyof OBJECT & string]: PATH extends ''
        ? K | (OBJECT[K] extends Record<string, any> ? PathsHelper<OBJECT[K], K, K> : never)
        :
            | `${PATH}.${K}`
            | (OBJECT[K] extends Record<string, any>
                ? PathsHelper<OBJECT[K], `${PATH}.${K}`, `${PATH}.${K}` | ACC>
                : never)
    }[keyof OBJECT & string]
  | ACC

export type GetValueByPath<OBJECT, PATH extends string> = PATH extends keyof OBJECT
  ? OBJECT[PATH]
  : PATH extends `${infer K}.${infer Rest}`
  ? K extends keyof OBJECT
    ? GetValueByPath<OBJECT[K], Rest & string>
    : never
  : never
