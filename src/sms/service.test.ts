import { addErrorMethodsToFake } from '../core/fake'
import { createFakeSMSBackend } from './fake'
import { type PhoneNumber } from './phone-number'
import { createSender } from './service'

const TEST_VERIFICATION_REQUEST = {
  to: '+11234567890' as PhoneNumber,
  code: '123456',
}

const TEST_MESSAGE_REQUEST = {
  to: '+11234567890' as PhoneNumber,
  content: 'test message',
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

  describe('Sending SMS', () => {
    it('should use the provided backend', () => {
      const { messageRequests, backend } = createFakeSMSBackend()
      const smsSender = createSender(backend)
      smsSender.sendMessage(TEST_MESSAGE_REQUEST)
      expect(messageRequests).toEqual([TEST_MESSAGE_REQUEST])
    })

    it('should throw error if the backend fails', (done) => {
      const error = new Error('Fake Backend Failed')
      const { backend } = createFakeSMSBackend()
      const failingBackend = addErrorMethodsToFake(() => backend)({
        sendMessage: { type: 'observable', error },
      })
      const smsSender = createSender(failingBackend)
      smsSender.sendMessage(TEST_MESSAGE_REQUEST).subscribe({
        error: (err) => {
          expect(err.message).toBe('SMS sending failed')
          expect(err.cause).toBe(error)
          done()
        },
      })
    })
  })
})
