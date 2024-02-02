import { createMemoryRawKeyValueStore } from './memory'

test('MemoryRawKeyValueStore non set key should be undefined', () => {
  const store = createMemoryRawKeyValueStore()
  expect(store.get('key')).toBe(undefined)
})

test('MemoryRawKeyValueStore it should set the value', () => {
  const store = createMemoryRawKeyValueStore()
  store.set('key', 1)
  expect(store.get('key')).toBe(1)
})
