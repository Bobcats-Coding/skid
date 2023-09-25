import { PhoneNumber } from './phone-number'
import { createTwilioBackend } from './twilio'

import twilio from 'twilio'

const FAKE_CONFIG = {
  accountSid: 'aaaa',
  authToken: 'bbbb',
  verificationServiceId: 'cccc',
}
const FAKE_REQUEST = {
  to: '+111' as PhoneNumber,
  code: '----',
}

describe('TwilioApi', () => {
  it('should send verification request', (done) => {
    const backend = createTwilioBackend(FAKE_CONFIG)

    const result = backend.requestVerification(FAKE_REQUEST)

    expect(twilio).toHaveBeenLastCalledWith(FAKE_CONFIG.accountSid, FAKE_CONFIG.authToken)
    expect(twilio().verify.v2.services).toHaveBeenLastCalledWith(FAKE_CONFIG.verificationServiceId)
    expect(twilio().verify.v2.services('').verifications.create).toHaveBeenLastCalledWith({
      to: FAKE_REQUEST.to,
      channel: 'sms',
      code: FAKE_REQUEST.code,
    })
    result.subscribe((output) => {
      expect(output).toBe(undefined)
      done()
    })
  })

  it('should reject if verification request failed', (done) => {
    jest
      .spyOn(twilio().verify.v2.services('').verifications, 'create')
      .mockRejectedValueOnce(new Error())

    const backend = createTwilioBackend(FAKE_CONFIG)

    const result = backend.requestVerification(FAKE_REQUEST)
    result.subscribe({
      error: () => {
        done()
      },
    })
  })

  it('should send verification attempt', (done) => {
    jest.spyOn(twilio().verify.v2.services('').verificationChecks, 'create')

    const backend = createTwilioBackend(FAKE_CONFIG)

    const result = backend.verify(FAKE_REQUEST)

    expect(twilio).toHaveBeenLastCalledWith(FAKE_CONFIG.accountSid, FAKE_CONFIG.authToken)
    expect(twilio().verify.v2.services).toHaveBeenLastCalledWith(FAKE_CONFIG.verificationServiceId)
    expect(twilio().verify.v2.services('').verificationChecks.create).toHaveBeenLastCalledWith({
      to: FAKE_REQUEST.to,
      code: FAKE_REQUEST.code,
    })
    expect(twilio().verify.v2.services('').verifications.create)
    result.subscribe((output) => {
      expect(output.status).toBe('verified')
      done()
    })
  })

  it('should handle failed verification attempt', (done) => {
    jest
      .spyOn(twilio().verify.v2.services('').verificationChecks, 'create')
      // @ts-expect-error // @TODO how to solve this?
      .mockResolvedValueOnce({ status: 'pending' })

    const backend = createTwilioBackend(FAKE_CONFIG)

    const result = backend.verify(FAKE_REQUEST)

    expect(twilio).toHaveBeenLastCalledWith(FAKE_CONFIG.accountSid, FAKE_CONFIG.authToken)
    expect(twilio().verify.v2.services).toHaveBeenLastCalledWith(FAKE_CONFIG.verificationServiceId)
    expect(twilio().verify.v2.services('').verificationChecks.create).toHaveBeenLastCalledWith({
      to: FAKE_REQUEST.to,
      code: FAKE_REQUEST.code,
    })
    expect(twilio().verify.v2.services('').verificationChecks.create)
    result.subscribe((output) => {
      expect(output.status).toBe('failed')
      done()
    })
  })
})
