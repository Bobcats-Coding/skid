import type {
  FromCamelCase,
  FromKebabCase,
  Guard,
  JoinArray,
  JsonType,
  Mutable,
  ObjectWithStringLiteralKey,
  Split,
  StringLiteral,
  ToCamelCase,
  ToKebabCase,
} from './type'

import deepEqualFromLib from 'deep-equal'
import { lastValueFrom, type Observable, scan } from 'rxjs'

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

export const pluralize = (str: string, value: number, prefix: boolean = false): string => {
  return `${prefix ? value + ' ' : ''}${str}${Math.abs(value) === 1 ? '' : 's'}`
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

export const deepEqual = (actual: any, expected: any): boolean => {
  return deepEqualFromLib(actual, expected)
}

export const deepEqualPartial = (actual: any, expected: any): boolean => {
  if (actual === undefined || actual === null) {
    return true
  }
  const isObject = (input: any): input is Record<string, any> => typeof input === 'object'
  if (!isObject(expected)) {
    return expected === actual
  }
  if (!isObject(actual)) {
    return false
  }
  return Object.keys(actual).every((key) => {
    const val = actual[key]
    if (val instanceof Object) {
      return deepEqualPartial(expected[key], val)
    }
    return actual[key] === expected[key]
  })
}

export const findByPattern = <
  MATCH extends JsonType,
  const PATTERNS extends readonly FindByPatterns[],
>(
  patterns: PATTERNS,
  itemToMatch: MATCH,
): GetValueFromPatternList<PATTERNS> | undefined =>
  patterns
    .map(toPatternResolver)
    .sort((a, b) => a.priority - b.priority)
    .find(({ match }) => match(itemToMatch))?.value

export const optionalPatternToList = <const VALUE>(value: VALUE): OptionalPatternToList<VALUE> => {
  if (Array.isArray(value)) {
    return value as OptionalPatternToList<VALUE>
  }
  return [{ value }] as OptionalPatternToList<VALUE>
}

export type FindByPatterns = FindByPattern | FindByPartialPattern | FindByDefault

export type FindByPattern<VALUE = any, PATTERN extends JsonType = JsonType> = {
  readonly value: VALUE
  readonly pattern: PATTERN
}

export type FindByPartialPattern<VALUE = any, PATTERN extends JsonType = JsonType> = {
  readonly value: VALUE
  readonly patternPartial: Partial<PATTERN>
}

export type FindByDefault<VALUE = any> = {
  readonly value: VALUE
}

export type OptionalPatternList<VALUE, PATTERN extends JsonType> =
  | VALUE
  | Array<
      FindByPattern<VALUE, PATTERN> | FindByPartialPattern<VALUE, PATTERN> | FindByDefault<VALUE>
    >

export type GetValueFromPatternList<PATTERNS extends readonly FindByPatterns[]> =
  PATTERNS[number]['value']

export type OptionalPatternToList<VALUE> = VALUE extends readonly FindByPatterns[]
  ? VALUE
  : readonly [FindByDefault<VALUE>]

type PatternResolver<VALUE = any> = {
  value: VALUE
  match: <MATCH extends JsonType>(itemToMatch: MATCH) => boolean
  priority: number
}

const createPatternResolver = ({ pattern, value }: FindByPattern): PatternResolver => ({
  value,
  match: (itemToMatch) => deepEqual(pattern, itemToMatch),
  priority: 0,
})
createPatternResolver.is = (pattern: FindByPatterns): pattern is FindByPattern =>
  'pattern' in pattern

const createPatternPartialResolver = ({
  patternPartial,
  value,
}: FindByPartialPattern): PatternResolver => ({
  value,
  match: (itemToMatch) => deepEqualPartial(patternPartial, itemToMatch),
  priority: 1,
})
createPatternPartialResolver.is = (pattern: FindByPatterns): pattern is FindByPartialPattern =>
  'patternPartial' in pattern

const createDefaultResolver = ({ value }: FindByDefault): PatternResolver => ({
  value,
  match: () => true,
  priority: 2,
})

const toPatternResolver = (pattern: FindByPatterns): PatternResolver => {
  if (createPatternResolver.is(pattern)) {
    return createPatternResolver(pattern)
  }
  if (createPatternPartialResolver.is(pattern)) {
    return createPatternPartialResolver(pattern)
  }
  return createDefaultResolver(pattern)
}

export const isDefined = <T>(value: T): value is NonNullable<T> => {
  return value !== null && value !== undefined
}

export const assertDefined = <T>(
  value: T,
  messageOption: ErrorMessage<T> = 'Undefined value',
): NonNullable<T> => {
  if (value === null || value === undefined) {
    throw new Error(getErrorMessage(messageOption, value))
  }
  return value
}

export const assertTypeByGuard = <T, V>({
  value,
  guard,
  message,
}: AssertTypeByGuardArg<T, V>): V & T => {
  if (!guard(value)) {
    throw new Error(getErrorMessage(message, value))
  }
  return value
}

const getErrorMessage = <T>(message: ErrorMessage<T>, value: T): string =>
  typeof message === 'function' ? message(value) : message

type ErrorMessage<T> = string | ((value: T) => string)

type AssertTypeByGuardArg<T, V> = {
  value: V
  guard: Guard<T>
  message: ErrorMessage<V>
}

export const collectValuesFrom = async <T>(values$: Observable<T>): Promise<T[]> =>
  await lastValueFrom(values$.pipe(scan((acc, value) => [...acc, value], [] as T[])))

export function isAbortError(err: unknown): boolean {
  if (err == null) return false
  const name = (err as any).name as string | undefined
  const message = ((err as any).message as string | undefined) ?? ''
  return name === 'AbortError' || /AbortError/i.test(message)
}

export function isNetworkError(err: unknown): boolean {
  if (err == null) return false
  return err instanceof TypeError && /Load failed/i.test(String(err.message))
}
