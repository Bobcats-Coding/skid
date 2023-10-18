import { makeObjectFromStringLiteral, split } from './util'

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
