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
    expect(twilio().verify.v2.services).toHaveBeenLastCalledWith(mockConfig.verificationServiceId)
    expect(twilio().verify.v2.services('').verifications.create).toHaveBeenLastCalledWith({
      to: mockRequest.to,
      channel: 'sms',
      code: mockRequest.code,
    })
    result.subscribe((output) => {
      expect(output).toBe(undefined)
      done()
    })
  })

  it('should reject if verification request failed', (done) => {
    const mockConfig = {
      accountSid: 'aaaa',
      authToken: 'bbbb',
      verificationServiceId: 'cccc',
    }
    const mockRequest = {
      to: '+111',
      code: '----',
    }

    jest
      .spyOn(twilio().verify.v2.services('').verifications, 'create')
      .mockRejectedValueOnce(new Error())

    const backend = createTwilioBackend(mockConfig)

    const result = backend.requestVerification(mockRequest)
    result.subscribe({
      error: () => {
        done()
      },
    })
  })

  it('should send verification attempt', (done) => {
    const mockConfig = {
      accountSid: 'aaaa',
      authToken: 'bbbb',
      verificationServiceId: 'cccc',
    }
    const mockRequest = {
      to: '+111',
      code: '----',
    }

    jest.spyOn(twilio().verify.v2.services('').verificationChecks, 'create')

    const backend = createTwilioBackend(mockConfig)

    const result = backend.verify(mockRequest)

    expect(twilio).toHaveBeenLastCalledWith(mockConfig.accountSid, mockConfig.authToken)
    expect(twilio().verify.v2.services).toHaveBeenLastCalledWith(mockConfig.verificationServiceId)
    expect(twilio().verify.v2.services('').verificationChecks.create).toHaveBeenLastCalledWith({
      to: mockRequest.to,
      code: mockRequest.code,
    })
    expect(twilio().verify.v2.services('').verifications.create)
    result.subscribe((output) => {
      expect(output.status).toBe('verified')
      done()
    })
  })

  it('should handle failed verification attempt', (done) => {
    const mockConfig = {
      accountSid: 'aaaa',
      authToken: 'bbbb',
      verificationServiceId: 'cccc',
    }
    const mockRequest = {
      to: '+111',
      code: '----',
    }

    jest
      .spyOn(twilio().verify.v2.services('').verificationChecks, 'create')
      // @ts-expect-error // @TODO how to solve this?
      .mockResolvedValueOnce({ status: 'pending' })

    const backend = createTwilioBackend(mockConfig)

    const result = backend.verify(mockRequest)

    expect(twilio).toHaveBeenLastCalledWith(mockConfig.accountSid, mockConfig.authToken)
    expect(twilio().verify.v2.services).toHaveBeenLastCalledWith(mockConfig.verificationServiceId)
    expect(twilio().verify.v2.services('').verificationChecks.create).toHaveBeenLastCalledWith({
      to: mockRequest.to,
      code: mockRequest.code,
    })
    expect(twilio().verify.v2.services('').verificationChecks.create)
    result.subscribe((output) => {
      expect(output.status).toBe('failed')
      done()
    })
  })
})
