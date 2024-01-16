import { createEnvVarRawKeyValueStore } from '../key-value-stores/raw-stores/env-var'
import { createFeatureFlipperService } from './service'

test('it should return the enabled status', async () => {
  const { isEnabled }  = createFeatureFlipperService(FEATURE_FLIPPER_CONFIG_TEST)
  expect(isEnabled('twilio')).toEqual(true)
})

test('the enabled status of a feature is overriden by the belonging environment variable', async () => {
  const store = createEnvVarRawKeyValueStore()
  store.set('FF_TWILIO', 'false')
  const { isEnabled }  = createFeatureFlipperService(FEATURE_FLIPPER_CONFIG_TEST)
  expect(isEnabled('twilio')).toEqual(false)
})

export const FEATURE_FLIPPER_CONFIG_TEST = [
  { name: 'twilio', value: true },
  { name: 'rooam', value: false },
] as const
