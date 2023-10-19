import { createKeyValueStoreDeep, type RawKeyValueStore } from './service-deep'

import { z } from 'zod'

test('KeyValueStoreDeep single validator', () => {
  const rawStore: RawKeyValueStore = {
    get: (_: string) => 'value',
  }
  const store = createKeyValueStoreDeep(rawStore, {
    key: z.string(),
  } as const)
  const value: string = store.get('key')
  expect(value).toBe('value')
})

test('KeyValueStoreDeep multiple validators', () => {
  const rawStore: RawKeyValueStore = {
    get: (arg: string) => (arg === 'key1' ? 1 : 2),
  }
  const store = createKeyValueStoreDeep(rawStore, {
    key1: z.literal(1),
    key2: z.literal(2),
  } as const)
  const value1: 1 = store.get('key1')
  expect(value1).toBe(1)
  const value2: 2 = store.get('key2')
  expect(value2).toBe(2)
  // @ts-expect-error
  store.get('key2') satisfies 3
})

test('KeyValueStoreDeep type validation', () => {
  const rawStore: RawKeyValueStore = {
    get: (arg: string) => (arg === 'key1' ? 1 : 2),
  }
  const store = createKeyValueStoreDeep(rawStore, {
    key1: z.literal(1),
    key2: z.literal(2),
  } as const)
  // @ts-expect-error
  const value1: 2 = store.get('key1')
  expect(value1).toBe(1)
})

test('KeyValueStoreDeep failed validation in guard', () => {
  const rawStore: RawKeyValueStore = {
    get: (_: string) => ({ number: 2 }),
  }
  const store = createKeyValueStoreDeep(rawStore, {
    key: z.literal(1),
  } as const)
  let message
  let cause
  try {
    store.get('key')
  } catch (e: any) {
    message = e.message
    cause = e.cause
  }
  expect(message).toBe('Invalid type in store: "key" => {"number":2}')
  expect(cause.issues[0].code).toBe('invalid_literal')
})

test('KeyValueStoreDeep deep validator', () => {
  const rawStore: RawKeyValueStore = {
    get: (arg: string) => {
      switch (arg) {
        case 'key1':
          return 1
        case 'key2':
          return { key3: 3 }
        case 'key2.key3':
          return 3
        default:
          return undefined
      }
    },
  }
  const store = createKeyValueStoreDeep(rawStore, {
    key1: z.literal(1),
    key2: z.object({ key3: z.literal(3) }),
  } as const)
  const value1: 1 = store.get('key1')
  expect(value1).toBe(1)
  const value2: { key3: 3 } = store.get('key2')
  expect(value2).toEqual({ key3: 3 })
  const value3: 3 = store.get('key2.key3')
  expect(value3).toBe(3)
  // @ts-expect-error
  store.get('key2.key3') satisfies 4
})

test('KeyValueStoreDeep validate all keys', () => {
  const rawStore: RawKeyValueStore = {
    get: (arg: string) => (arg === 'key1' ? 1 : 3),
  }
  const store = createKeyValueStoreDeep(rawStore, {
    key1: z.literal(1),
    key2: z.literal(2),
  } as const)
  let message
  let cause
  try {
    store.validate()
  } catch (e: any) {
    message = e.message
    cause = e.cause
  }
  expect(message).toBe('Invalid type in store: "key2" => 3')
  expect(cause.issues[0].code).toBe('invalid_literal')
})

test('KeyValueStoreDeep store throws error', () => {
  const error = new Error('Store error')
  const rawStore: RawKeyValueStore = {
    get: (_: string) => {
      throw error
    },
  }
  const store = createKeyValueStoreDeep(rawStore, {
    key: z.literal(1),
  } as const)
  let message
  let cause
  try {
    store.get('key')
  } catch (e: any) {
    message = e.message
    cause = e.cause
  }
  expect(message).toBe('Key is not present in store: "key"')
  expect(cause).toBe(error)
})
