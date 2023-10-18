import { getSchemaByObjectPath, zodGuard } from './zod'

import { z } from 'zod'

test('zodGuard returns a custom schema based on the guard type', () => {
  const schema = zodGuard((arg: unknown): arg is 1 => arg === 1)
  const one: 1 = schema.parse(1)
  expect(one).toBe(1)
})

test('zodGuard accepts custom error', () => {
  const schema = zodGuard((arg: unknown): arg is 1 => arg === 1, 'it is not 1')
  const result = schema.safeParse(2)
  if (!result.success) {
    expect(result.error.issues[0]?.message).toBe('it is not 1')
  }
})

test('getSchemaByObjectPath gets a single key path', () => {
  const schema = getSchemaByObjectPath(z.object({ key1: z.literal(1), key2: z.literal(2) }), 'key1')
  const one: 1 = schema.parse(1)
  expect(one).toBe(1)
})

test('getSchemaByObjectPath gets a deep key path', () => {
  const schema = getSchemaByObjectPath(
    z.object({ key1: z.object({ key2: z.object({ key3: z.literal(3) }) }) }),
    'key1.key2.key3',
  )
  const three: 3 = schema.parse(3)
  expect(three).toBe(3)
})

test('getSchemaByObjectPath gets the full object on empty path', () => {
  const schema = getSchemaByObjectPath(z.object({ key1: z.literal(1), key2: z.literal(2) }), '')
  const object: { key1: 1; key2: 2 } = schema.parse({ key1: 1, key2: 2 })
  expect(object).toEqual({ key1: 1, key2: 2 })
})
