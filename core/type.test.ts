import type {
  EntryTuple,
  FilterRecord,
  GetAllPaths,
  GetGuarded,
  GetKey,
  GetValue,
  GetValueByKey,
  GetValueByPath,
  Guard,
  JoinArray,
  JsonType,
  ObjectWithStringLiteralKey,
  RecordToEntries,
  Split,
  SplitFilePath,
  SplitObjectPath,
  StringLiteral,
  TokenNonEmptyString,
} from './type'

import { assert } from 'tsafe'
import type { Equals } from 'tsafe'

test('Split<PATH, DELIMITER>', () => {
  assert<Equals<Split<'a.a.a', '.'>, readonly ['a', 'a', 'a']>>()
  assert<Equals<Split<'a', '.'>, readonly ['a']>>()
  assert<Equals<Split<'', '.'>, readonly ['']>>()
  // @ts-expect-error it has to be a string
  type error1 = Split<1, '.'>
  assert<Equals<error1, error1>>()
  // @ts-expect-error it has to be a string
  type error2 = Split<'', 1>
  assert<Equals<error2, error2>>()
})

test('SplitObjectPath<PATH>', () => {
  assert<Equals<SplitObjectPath<'a.a.a'>, readonly ['a', 'a', 'a']>>()
  assert<Equals<SplitObjectPath<'a'>, readonly ['a']>>()
  assert<Equals<SplitObjectPath<''>, readonly ['']>>()
  // @ts-expect-error it has to be a string
  type error = SplitObjectPath<1>
  assert<Equals<error, error>>()
})

test('SplitFilePath<PATH>', () => {
  assert<Equals<SplitFilePath<'a/a/a'>, readonly ['a', 'a', 'a']>>()
  assert<Equals<SplitFilePath<'a'>, readonly ['a']>>()
  assert<Equals<SplitFilePath<''>, readonly ['']>>()
  // @ts-expect-error it has to be a string
  type error = SplitFilePath<1>
  assert<Equals<error, error>>()
})

test('StringLiteral<LITERAL>', () => {
  const literal: StringLiteral<'asd'> = 'asd' as const
  assert<Equals<typeof literal, 'asd'>>()
  // @ts-expect-error it has to be a literal
  const nonLiteral: StringLiteral<'asd'> = 'asd' as string
  assert<Equals<typeof nonLiteral, 'asd'>>()
})

test('ObjectWithStringLiteralKey<KEY, VALUE>', () => {
  const obj: ObjectWithStringLiteralKey<'a', 1> = {
    a: 1,
  } as const
  assert<Equals<typeof obj, { a: 1 }>>()
  // @ts-expect-error it has to be a literal
  const nonLiteral: ObjectWithStringLiteralKey<'a', 1> = {
    a: 1,
  } as unknown as Record<string, 1>
  assert<Equals<typeof nonLiteral, { a: 1 }>>()
})

test('JsonType', () => {
  const json = {
    a: 1,
    b: '2',
    c: true,
    d: null,
    e: [1, '2', true, null, [1, '2', true, null]],
  }
  assert<Equals<typeof json, typeof json>>()

  // @ts-expect-error it cannot be a function
  const nonJson: JsonType = {
    f: () => {},
  }
  assert<Equals<typeof nonJson, typeof nonJson>>()
})

test('TokenNonEmptyString<TOKEN>', () => {
  const token: TokenNonEmptyString<'a'> = 'a' as const
  assert<Equals<typeof token, 'a'>>()
  // @ts-expect-error it cannot be empty
  const nonToken: TokenNonEmptyString<''> = '' as const
  assert<Equals<typeof nonToken, never>>()
})

test('Guard<TYPE>', () => {
  const guard: Guard<1> = (arg: unknown): arg is 1 => arg === 1
  assert<Equals<typeof guard, typeof guard>>()
  // @ts-expect-error it has to be a guard
  const nonGuard: Guard<1> = (arg: unknown): boolean => arg === 1
  assert<Equals<typeof nonGuard, typeof nonGuard>>()
})

test('GetGuarded<GUARD>', () => {
  const guard = (arg: unknown): arg is 1 => arg === 1
  assert<Equals<GetGuarded<typeof guard>, 1>>()
})

test('EntryTuples', () => {
  type Entries = RecordToEntries<{ a: 1; b: 2 }>
  assert<Equals<Entries, EntryTuple<'a', 1> | EntryTuple<'b', 2>>>()
  assert<Equals<GetKey<Entries>, 'a' | 'b'>>()
  assert<Equals<GetValue<Entries>, 1 | 2>>()
  assert<Equals<GetValueByKey<Entries, 'a'>, 1>>()
})

test('FilterRecord<RECORD, TYPE>', () => {
  type Filtered = FilterRecord<{ a: 1; b: 2; c: '3' }, number>
  // TODO remove the keys as well
  assert<Equals<Filtered, { a: 1; b: 2; c: never }>>()
})

test('GetAllPaths<OBJECT>', () => {
  type Paths = GetAllPaths<{ a: { b: { c: 1 }; d: 2 }; e: 3 }>
  assert<Equals<Paths, 'a' | 'a.b' | 'a.b.c' | 'a.d' | 'e'>>()
})

test('GetValuesByPath<OBJECT, PATH>', () => {
  type ObjectStructure = { a: { b: { c: 1 }; d: 2 }; e: 3 }
  type Values = GetValueByPath<ObjectStructure, 'a.b.c'>
  assert<Equals<Values, 1>>()
})

test('JoinArray<STRINGS, DELIMITER>', () => {
  type Joined = JoinArray<['a', 'b', 'c'], '.'>
  assert<Equals<Joined, 'a.b.c'>>()
})
