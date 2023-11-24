import {
  camelCase2kebabCase,
  capitalize,
  join,
  kebabCase2camelCase,
  makeObjectFromStringLiteral,
  split,
} from './util'

import { assert, type Equals } from 'tsafe'

test('makeObjectFromStringLiteral', () => {
  const obj = makeObjectFromStringLiteral('key' as const, 1)
  expect(obj['key' as const] satisfies number).toBe(1)
})

test('split is working in a typesafe way', () => {
  const splitted = split('a.a.a', '.')
  assert<Equals<typeof splitted, readonly ['a', 'a', 'a']>>()
  expect(splitted).toEqual(['a', 'a', 'a'])
})

test('join is working in a typesafe way', () => {
  const joined = join<['a', 'a', 'a'], '.'>(['a', 'a', 'a'], '.')
  assert<Equals<typeof joined, 'a.a.a'>>()
  expect(joined).toBe('a.a.a')
})

test('capitalize', () => {
  const capitalized = capitalize('apple')
  assert<Equals<typeof capitalized, 'Apple'>>()
  expect(capitalized).toBe('Apple')
})

test('kebabCase2camelCase', () => {
  const kebabCase = 'first-second-third' as const
  const camelCase = 'firstSecondThird' as const
  const output = kebabCase2camelCase(kebabCase)
  expect(output).toBe(camelCase)
  assert<Equals<typeof output, typeof camelCase>>()
})

test('camelCase2kebabCase', () => {
  const kebabCase = 'first-second-third' as const
  const camelCase = 'firstSecondThird' as const
  const output = camelCase2kebabCase(camelCase)
  expect(output).toBe(kebabCase)
  assert<Equals<typeof output, typeof kebabCase>>()
})
