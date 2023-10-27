import { type SMSBackend, type VerificationAttempt, type VerificationRequest } from './types'

import { of } from 'rxjs'

export const createFakeSMSBackend = (): {
  backend: SMSBackend
  verificationRequests: VerificationRequest[]
  verificationAttempts: VerificationAttempt[]
} => {
  const verificationRequests: VerificationRequest[] = []
  const verificationAttempts: VerificationAttempt[] = []
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
  }

  return {
    verificationRequests,
    verificationAttempts,
    backend,
  }
}
