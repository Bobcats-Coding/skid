import { createFakeRandomBackend } from './fake'
import { createRandomService } from './service'

import { describe, expect, it } from 'vitest'

describe('Random Service', () => {
  describe('Integer generation', () => {
    it('should use the provided backend', () => {
      const { integerRequests, backend } = createFakeRandomBackend()
      const randomGenerator = createRandomService(backend)
      randomGenerator.generateInteger()
      expect(integerRequests).toEqual([[0, Number.MAX_SAFE_INTEGER]])
    })

    it('should set the parameters', () => {
      const { integerRequests, backend } = createFakeRandomBackend()
      const randomGenerator = createRandomService(backend)
      randomGenerator.generateInteger(10, 20)
      expect(integerRequests).toEqual([[10, 20]])
    })
  })
  describe('String generation', () => {
    it('should use the provided backend', () => {
      const { stringRequests, backend } = createFakeRandomBackend()
      const randomGenerator = createRandomService(backend)
      randomGenerator.generateString()
      expect(stringRequests).toEqual([16])
    })

    it('should set the length', () => {
      const { stringRequests, backend } = createFakeRandomBackend()
      const randomGenerator = createRandomService(backend)
      randomGenerator.generateString(8)
      expect(stringRequests).toEqual([8])
    })
  })
})
