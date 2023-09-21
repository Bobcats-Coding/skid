import { SMSBackend, VerificationRequest } from './types'

import { of } from 'rxjs'

export const createFakeSMSBackend = (): {
  backend: SMSBackend
  verificationRequests: VerificationRequest[]
} => {
  const verificationRequests: VerificationRequest[] = []
  const backend: SMSBackend = {
    requestVerification: (request) => {
      verificationRequests.push(request)
      return of(undefined)
    },
    verify: () => {
      return of({
        status: 'verified',
      })
    },
  }

  return {
    verificationRequests,
    backend,
  }
}
