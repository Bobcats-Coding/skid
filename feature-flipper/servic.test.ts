import { createMemoryRawKeyValueStore } from '../key-value-stores/raw-stores/memory'
import { createFeatureFlipperService } from './service'

test('it should return the enabled status', async () => {
  const { isEnabled } = createIsEnabled()
  expect(isEnabled('twilio')).toEqual(true)
})

test('the enabled status of a feature is overriden by the belonging environment variable', async () => {
  const { isEnabled, store } = createIsEnabled()
  store.set('FF_TWILIO', 'false')
  expect(isEnabled('twilio')).toEqual(false)
})

const createIsEnabled = () => {
  const store = createMemoryRawKeyValueStore<string | undefined>()
  const { isEnabled } = createFeatureFlipperService(FEATURE_FLIPPER_CONFIG_TEST, store)
  return { isEnabled, store }
}

export const FEATURE_FLIPPER_CONFIG_TEST = [
  { name: 'twilio', value: true },
  { name: 'rooam', value: false },
] as const
