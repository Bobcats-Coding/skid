import type { SMSBackend } from './types'

import { from, map } from 'rxjs'
import twilio from 'twilio'

type TwilioConfig = {
  accountSid: string
  authToken: string
  verificationServiceId: string
  messagingServiceId: string
}

export const createTwilioBackend = (config: TwilioConfig): SMSBackend => {
  const client = twilio(config.accountSid, config.authToken)
  return {
    sendMessage: (request) => {
      return from(
        client.messages.create({
          body: request.content,
          messagingServiceSid: config.messagingServiceId,
          to: request.to,
        }),
      ).pipe(map(() => undefined))
    },
    requestVerification: (request) => {
      return from(
        client.verify.v2.services(config.verificationServiceId).verifications.create({
          to: request.to,
          channel: 'sms',
          ...(request.code !== undefined && { code: request.code }),
        }),
      ).pipe(map(() => undefined))
    },
    verify: (attempt) => {
      return from(
        client.verify.v2
          .services(config.verificationServiceId)
          .verificationChecks.create({ code: attempt.code, to: attempt.to }),
      ).pipe(
        map((result) => ({
          status: result.status === 'approved' ? 'verified' : 'failed',
        })),
      )
    },
  }
}
