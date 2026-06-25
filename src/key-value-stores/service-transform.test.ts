import { createMemoryRawKeyValueStore } from './raw-stores/memory'
import { createTransformedStore } from './service-transform'
import { type ReadableRawKeyValueStore } from './type'

import { expect, test } from 'vitest'

test('it should transform store values based on the provided callback', () => {
  const transformedStore = createTransformedStore(mockStore, transformKeyValue)
  const result = transformedStore.get('feature_1')
  expect(result).toEqual(true)
})

test('it should return undefined for missing keys', () => {
  const transformedStore = createTransformedStore(mockStore, transformKeyValue)
  const result = transformedStore.get('feature_2')
  expect(result).toBeUndefined()
})

const mockStore = createMemoryRawKeyValueStore<string | undefined>()
mockStore.set('feature_1', 'true')

const transformKeyValue = (key: string, store: ReadableRawKeyValueStore): boolean | undefined => {
  const value = store.get(key)
  return value !== undefined ? value === 'true' : undefined
}
