import { createMemoryRawKeyValueStore } from '../key-value-stores/raw-stores/memory'
import type { WriteableRawKeyValueStore } from '../key-value-stores/type'
import { createFeatureFlipperService } from './service'
import type { FeatureFlipperService } from './service'

import { expect, test } from 'vitest'

test('it should return the enabled status', async () => {
  const { ffService } = createFfService()
  expect(ffService.isEnabled('feature_1')).toEqual(false)
})

test('the enabled status of a feature is overriden by the belonging environment variable', async () => {
  const { ffService, envVarStore } = createFfService()
  envVarStore.set('FF_FEATURE_1', 'true')
  expect(ffService.isEnabled('feature_1')).toEqual(true)
})

test('the enabled status of a feature is overriden by the belonging query param if url_override=true', async () => {
  const { ffService } = createFfService()
  ffService.setOverride('feature_2', false)
  expect(ffService.isEnabled('feature_2')).toEqual(false)
})

test('the enabled status of a feature is not overriden by the belonging query param if url_override=false', async () => {
  const { ffService, envVarStore } = createFfService()
  envVarStore.set('FF_URL_OVERRIDE', 'false')
  ffService.setOverride('feature_2', false)
  expect(ffService.isEnabled('feature_2')).toEqual(true)
})

test('if url_override=true query param overrides env var value', async () => {
  const { ffService, envVarStore } = createFfService()
  envVarStore.set('PUBLIC_FF_FEATURE_2', 'true')
  ffService.setOverride('feature_2', false)
  expect(ffService.isEnabled('feature_2')).toEqual(false)
})

test('it should return false it at least one identity regex equals to false', async () => {
  const { ffService } = createFfService()
  expect(ffService.isEnabled('feature_1', { id1: 'example', id2: 'yy@example.com' })).toEqual(false)
})

test('value from identity is higher overrides env var value', async () => {
  const { ffService, envVarStore } = createFfService()
  envVarStore.set('FF_FEATURE_1', 'true')
  expect(ffService.isEnabled('feature_1', { id1: 'example' })).toEqual(false)
})

test('test identity percentage 20, 50, 90 ', async () => {
  const { ffService } = createFfService()

  const allOneLetterHashes = Array.from({ length: 65535 }, (_, i) => String.fromCharCode(i))
  const allOnOffLength = allOneLetterHashes.length
  const allOnOff20 = allOneLetterHashes.map((identity) => {
    return ffService.isEnabled('feature_3', { id1: identity })
  })
  const allOnOff50 = allOneLetterHashes.map((identity) => {
    return ffService.isEnabled('feature_3', { id2: identity })
  })
  const allOnOff90 = allOneLetterHashes.map((identity) => {
    return ffService.isEnabled('feature_3', { id3: identity })
  })

  const countTrueValuesAndExpectPercentage = (
    trueValuesArray: boolean[],
    expectedPercentage: number,
  ): void => {
    const countTrue = trueValuesArray.reduce(
      (accumulator, currentValue) => accumulator + (currentValue ? 1 : 0),
      0,
    )
    expect((countTrue / allOnOffLength) * 100).toBeCloseTo(expectedPercentage, 1)
  }

  countTrueValuesAndExpectPercentage(allOnOff20, 20)
  countTrueValuesAndExpectPercentage(allOnOff50, 50)
  countTrueValuesAndExpectPercentage(allOnOff90, 90)
})

type FfStore = {
  ffService: FeatureFlipperService<typeof CONFIG_TEST>
  envVarStore: WriteableRawKeyValueStore<string | undefined>
}

const createFfService = (): FfStore => {
  const envVarStore = createMemoryRawKeyValueStore<string | undefined>()
  const ffService = createFeatureFlipperService(CONFIG_TEST, envVarStore)
  return { ffService, envVarStore }
}

const CONFIG_TEST = [
  {
    name: 'feature_1',
    value: false,
    identity: {
      id1: {
        type: 'regex',
        value: /.*@example.com/,
      },
      id2: {
        type: 'regex',
        value: /.*@example.com/,
      },
    },
  },
  { name: 'feature_2', value: true },
  { name: 'url_override', value: true },
  { name: 'bypass_verification', value: true },
  { name: 'order_limit', value: false },
  {
    name: 'feature_3',
    value: true,
    identity: {
      id1: {
        type: 'percentage',
        value: 20,
      },
      id2: {
        type: 'percentage',
        value: 50,
      },
      id3: {
        type: 'percentage',
        value: 90,
      },
    },
  },
] as const
