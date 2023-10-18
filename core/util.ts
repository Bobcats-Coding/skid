import type { JoinArray, ObjectWithStringLiteralKey, Split, StringLiteral } from './type'

export const typeKey = Symbol('type')

export const makeObjectFromStringLiteral = <KEY, VALUE>(
  key: StringLiteral<KEY>,
  value: VALUE,
): ObjectWithStringLiteralKey<KEY, VALUE> => {
  // We have to cast the type because [key] is always considered as string
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return { [key]: value } as ObjectWithStringLiteralKey<KEY, VALUE>
}

export const split = <const STRING extends string, const DELIMITER extends string>(
  str: STRING,
  delimiter: DELIMITER,
): Split<STRING, DELIMITER> => str.split(delimiter) as unknown as Split<STRING, DELIMITER>

export const join = <const KEYS extends string[], const DELIMITER extends string>(
  keys: KEYS,
  delimiter: DELIMITER,
): JoinArray<KEYS, DELIMITER> => keys.join(delimiter) as JoinArray<KEYS, DELIMITER>
