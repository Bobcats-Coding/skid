import type {
  FromCamelCase,
  FromKebabCase,
  JoinArray,
  Mutable,
  ObjectWithStringLiteralKey,
  Split,
  StringLiteral,
  ToCamelCase,
  ToKebabCase,
} from './type'

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

export const capitalize = <const STRING extends string>(str: STRING): Capitalize<STRING> => {
  return `${str[0]?.toUpperCase()}${str.slice(1)}` as Capitalize<STRING>
}

const fromKebabCase = <const KEBAB_CASE extends string>(
  kebabCase: KEBAB_CASE,
): FromKebabCase<KEBAB_CASE> => {
  return split(kebabCase, '-') as FromKebabCase<KEBAB_CASE>
}

const toKebabCase = <const SEGMENTS extends readonly string[]>(
  segments: SEGMENTS,
): ToKebabCase<SEGMENTS> => {
  const mutableSegments = segments as Mutable<typeof segments>
  return join(mutableSegments, '-')
}

const fromCamelCase = <S extends string>(input: S): FromCamelCase<S> => {
  const segments = input.match(/[A-Z]?[a-z]+|[0-9]+/g) ?? []
  return segments.map((s) => s.toLowerCase()) as unknown as FromCamelCase<S>
}

export const toCamelCase = <const SEGMENTS extends readonly string[]>(
  segments: SEGMENTS,
): ToCamelCase<SEGMENTS> => {
  return segments.reduce((acc, segment, index) => {
    if (index === 0) {
      return segment
    }
    if (segment.length === 0) {
      return acc
    }
    return `${acc}${capitalize(segment)}`
  }, '') as ToCamelCase<SEGMENTS>
}

export const kebabCase2camelCase = <const KEBAB_CASE extends string>(
  kebabCase: KEBAB_CASE,
): ToCamelCase<FromKebabCase<KEBAB_CASE>> => toCamelCase(fromKebabCase(kebabCase))

export const camelCase2kebabCase = <const CAMEL_CASE extends string>(
  camelCase: CAMEL_CASE,
): ToKebabCase<FromCamelCase<CAMEL_CASE>> => toKebabCase(fromCamelCase(camelCase))
