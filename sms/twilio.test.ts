import { createTwilioBackend } from './twilio'

import twilio from 'twilio'

describe('TwilioApi', () => {
  it('should send verification request', (done) => {
    const mockConfig = {
      accountSid: 'aaaa',
      authToken: 'bbbb',
      verificationServiceId: 'cccc',
    }
    const mockRequest = {
      to: '+111',
      code: '----',
    }

    const backend = createTwilioBackend(mockConfig)

    const result = backend.requestVerification(mockRequest)

    expect(twilio).toHaveBeenLastCalledWith(mockConfig.accountSid, mockConfig.authToken)
    expect(twilio().verify.v2.services).toHaveBeenLastCalledWith(mockConfig.verificationServiceId) // assert VerificationServiceId
    expect(twilio().verify.v2.services('').verifications.create).toHaveBeenLastCalledWith({
      to: mockRequest.to,
      channel: 'sms',
      code: mockRequest.code,
    })
    expect(twilio().verify.v2.services('').verifications.create)
    result.subscribe((output) => {
      expect(output).toBe(undefined)
      done()
    })
  })

  // test if error is thrown
})
