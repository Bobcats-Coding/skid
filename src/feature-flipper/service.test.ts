import { createMemoryRawKeyValueStore } from '../key-value-stores/raw-stores/memory'
import type { WriteableRawKeyValueStore } from '../key-value-stores/type'
import { createFeatureFlipperService } from './service'
import type { FeatureFlipperService } from './service'

test('it should return the enabled status', async () => {
  const { isEnabled } = createFfStore()
  expect(isEnabled('twilio')).toEqual(true)
})

test('the enabled status of a feature is overriden by the belonging environment variable', async () => {
  const { isEnabled, store } = createFfStore()
  store.set('FF_TWILIO', 'false')
  expect(isEnabled('twilio')).toEqual(false)
})

type FfStore = {
  isEnabled: FeatureFlipperService<
    (typeof FEATURE_FLIPPER_CONFIG_TEST)[number]['name']
  >['isEnabled']
  store: WriteableRawKeyValueStore<string | undefined>
}

const createFfStore = (): FfStore => {
  const store = createMemoryRawKeyValueStore<string | undefined>()
  const { isEnabled } = createFeatureFlipperService(FEATURE_FLIPPER_CONFIG_TEST, store)
  return { isEnabled, store }
}

export const FEATURE_FLIPPER_CONFIG_TEST = [
  { name: 'twilio', value: true },
  { name: 'rooam', value: false },
] as const
