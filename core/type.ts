export type StringLiteral<T> = T extends string ? (string extends T ? never : T) : never

export type ObjectWithStringLiteralKey<KEY, VALUE> = {
  [K in StringLiteral<KEY>]: VALUE
}

export type JsonType = number | string | boolean | null | JsonType[] | { [key: string]: JsonType }

export type TokenNonEmptyString<TOKEN extends string | number> = TOKEN extends '' ? never : TOKEN
