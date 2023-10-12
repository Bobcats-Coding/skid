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
