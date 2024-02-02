import {
  type SendMessageRequest,
  type SMSBackend,
  type VerificationAttempt,
  type VerificationRequest,
} from './types'

import { of } from 'rxjs'

export const createFakeSMSBackend = (): {
  backend: SMSBackend
  verificationRequests: VerificationRequest[]
  verificationAttempts: VerificationAttempt[]
  messageRequests: SendMessageRequest[]
} => {
  const verificationRequests: VerificationRequest[] = []
  const verificationAttempts: VerificationAttempt[] = []
  const messageRequests: SendMessageRequest[] = []
  const backend: SMSBackend = {
    requestVerification: (request) => {
      verificationRequests.push(request)
      return of(undefined)
    },
    verify: (attempt) => {
      verificationAttempts.push(attempt)
      return of({
        status: 'verified',
      })
    },
    sendMessage: (messageRequest) => {
      messageRequests.push(messageRequest)
      return of(undefined)
    },
  }

  return {
    verificationRequests,
    verificationAttempts,
    messageRequests,
    backend,
  }
}
