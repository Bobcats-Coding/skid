import { addErrorMethodsToFake } from '../core/fake'
import { createFakeSMSBackend } from './fake'
import { type PhoneNumber } from './phone-number'
import { createSender } from './service'

const TEST_VERIFICATION_REQUEST = {
  to: '+11234567890' as PhoneNumber,
  code: '123456',
}

describe('SMS Service', () => {
  describe('Request verification', () => {
    it('should use the provided backend', () => {
      const { verificationRequests, backend } = createFakeSMSBackend()
      const smsSender = createSender(backend)
      smsSender.requestVerification(TEST_VERIFICATION_REQUEST)
      expect(verificationRequests).toEqual([TEST_VERIFICATION_REQUEST])
    })

    it('should throw error if the backend fails', (done) => {
      const error = new Error('Fake Backend Failed')
      const { backend } = createFakeSMSBackend()
      const failingBackend = addErrorMethodsToFake(() => backend)({
        requestVerification: { type: 'observable', error },
      })
      const smsSender = createSender(failingBackend)
      smsSender.requestVerification(TEST_VERIFICATION_REQUEST).subscribe({
        error: (err) => {
          expect(err.message).toBe('SMS verification request failed')
          expect(err.cause).toBe(error)
          done()
        },
      })
    })
  })

  describe('Attempt to verify by code', () => {
    it('should return the result', () => {
      const { backend, verificationAttempts } = createFakeSMSBackend()
      const smsSender = createSender(backend)

      smsSender.verify(TEST_VERIFICATION_REQUEST).subscribe((result) => {
        expect(verificationAttempts).toEqual([TEST_VERIFICATION_REQUEST])
        expect(result.status).toEqual('verified')
      })
    })

    it('should throw error if the backend fails', (done) => {
      const error = new Error('Fake Backend Failed')
      const { backend } = createFakeSMSBackend()
      const failingBackend = addErrorMethodsToFake(() => backend)({
        verify: { type: 'observable', error },
      })
      const smsSender = createSender(failingBackend)
      smsSender.verify(TEST_VERIFICATION_REQUEST).subscribe({
        error: (err) => {
          expect(err.message).toBe('SMS verification failed')
          expect(err.cause).toBe(error)
          done()
        },
      })
    })
  })
})
