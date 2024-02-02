import { createMemoryDeepRawKeyValueStore } from './memory-deep'

test('MemoryDeepRawKeyValueStore non set key should throw an error', () => {
  const store = createMemoryDeepRawKeyValueStore()
  expect(() => store.get('key')).toThrow('Path: "key" is not set')
})

test('MemoryRawKeyValueStore set the value', () => {
  const store = createMemoryDeepRawKeyValueStore()
  store.set('key', 1)
  expect(store.get('key')).toBe(1)
})

test('MemoryDeepRawKeyValueStore get value from 1 level deep', () => {
  const store = createMemoryDeepRawKeyValueStore()
  store.set('key1', { key2: 2 })
  expect(store.get('key1.key2')).toBe(2)
})

test('MemoryDeepRawKeyValueStore get value from 2 level deep', () => {
  const store = createMemoryDeepRawKeyValueStore()
  store.set('key1', { key2: { key3: 3 } })
  expect(store.get('key1.key2.key3')).toBe(3)
})

test('MemoryDeepRawKeyValueStore get non set value from 2 level deep', () => {
  const store = createMemoryDeepRawKeyValueStore()
  store.set('key1', 1)
  expect(() => store.get('key1.key2.key3')).toThrow('Path: "key1.key2.key3" is not set')
})

test('MemoryDeepRawKeyValueStore get undefined value', () => {
  const store = createMemoryDeepRawKeyValueStore()
  store.set('key', undefined)
  expect(store.get('key')).toBe(undefined)
})

test('MemoryDeepRawKeyValueStore set value at 2 level deep', () => {
  const store = createMemoryDeepRawKeyValueStore()
  store.set('key1', { key2: { key3: 3 } })
  store.set('key1.key2.key3', 4)
  expect(store.get('key1.key2.key3')).toBe(4)
})

test('MemoryDeepRawKeyValueStore set non object value at 2 level deep', () => {
  const store = createMemoryDeepRawKeyValueStore()
  store.set('key1', { key2: 2 })
  expect(() => {
    store.set('key1.key2.key3', 3)
  }).toThrow('Value under path: "key1.key2" is not an object')
})
