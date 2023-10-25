import { createMemoryRawKeyValueStore } from './raw-stores/memory'
import { createKeyValueStore } from './service'
import type { RawKeyValueStore } from './type'

import { z } from 'zod'

test('KeyValueStore single validator', () => {
  const rawStore: RawKeyValueStore = {
    get: (_) => 'value',
    set: (_) => {},
  }
  const store = createKeyValueStore(rawStore, {
    key: z.string(),
  })
  const value: string = store.get('key')
  expect(value).toBe('value')
})

test('KeyValueStore multiple validators', () => {
  const rawStore: RawKeyValueStore = {
    get: (arg: string) => (arg === 'key1' ? 1 : 2),
    set: (_) => {},
  }
  const store = createKeyValueStore(rawStore, {
    key1: z.literal(1),
    key2: z.literal(2),
  })
  const value1: 1 = store.get('key1')
  expect(value1).toBe(1)
  const value2: 2 = store.get('key2')
  expect(value2).toBe(2)
})

test('KeyValueStore type validation', () => {
  const rawStore: RawKeyValueStore = {
    get: (arg: string) => (arg === 'key1' ? 1 : 2),
    set: (_) => {},
  }
  const store = createKeyValueStore(rawStore, {
    key1: z.literal(1),
    key2: z.literal(2),
  })
  // @ts-expect-error
  const value1: 2 = store.get('key1')
  expect(value1).toBe(1)
})

test('KeyValueStore failed validation in guard', () => {
  const rawStore: RawKeyValueStore = {
    get: (_) => ({ number: 2 }),
    set: (_) => {},
  }
  const store = createKeyValueStore(rawStore, {
    key: z.literal(1),
  })
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

test('KeyValueStore validate all keys', () => {
  const rawStore: RawKeyValueStore = {
    get: (arg: string) => (arg === 'key1' ? 1 : 3),
    set: (_) => {},
  }
  const store = createKeyValueStore(rawStore, {
    key1: z.literal(1),
    key2: z.literal(2),
  })
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

test('KeyValueStore store throws error', () => {
  const error = new Error('Store error')
  const rawStore: RawKeyValueStore = {
    get: (_) => {
      throw error
    },
    set: (_) => {},
  }
  const store = createKeyValueStore(rawStore, {
    key: z.literal(1),
  })
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

test('KeyValueStore set value', () => {
  const rawStore = createMemoryRawKeyValueStore()
  const store = createKeyValueStore(rawStore, {
    key: z.string(),
  })
  store.set('key', 'value')
  const value: string = store.get('key')
  expect(value).toBe('value')
})

test('KeyValueStore set value validate', () => {
  const rawStore = createMemoryRawKeyValueStore()
  const store = createKeyValueStore(rawStore, {
    key: z.string(),
  })
  let message
  let cause
  try {
    // @ts-expect-error
    store.set('key', 1)
  } catch (e: any) {
    message = e.message
    cause = e.cause
  }
  expect(message).toBe('Invalid value type for key: "key" => 1')
  expect(cause.issues[0].code).toBe('invalid_type')
})

test('KeyValueStore set and get should expect valid key', () => {
  const error = new Error('Store error')
  const rawStore: RawKeyValueStore = {
    get: (_) => {
      throw error
    },
    set: (_) => {
      throw error
    },
  }
  const store = createKeyValueStore(rawStore, {
    key: z.string(),
  })
  expect(() => {
    // @ts-expect-error
    store.set('key1', 'hello')
  }).toThrow('Invalid key: "key1"')
  // @ts-expect-error
  expect(() => store.get('key1')).toThrow('Invalid key: "key1"')
})
