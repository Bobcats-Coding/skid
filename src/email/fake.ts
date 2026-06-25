import type { EmailAddress } from './email-address'
import type { Email, EmailBackend } from './types'

import { of } from 'rxjs'

export const createFakeEmailBackend = (): { backend: EmailBackend; received: Email[] } => {
  const received: Email[] = []
  const backend: EmailBackend = {
    send: async (email) => {
      received.push(email)
    },
    requestVerification: (request) => {
      const verificationEmail: Email = {
        to: request.to,
        from: 'fake-verification@example.com' as EmailAddress,
        subject: '000000',
        body: `Verification requested for ${request.to}`,
        isHtml: false,
      }
      received.push(verificationEmail)
      return of(undefined)
    },
    verify: () => {
      return of({
        status: 'verified',
      })
    },
  }

  return {
    received,
    backend,
  }
}
