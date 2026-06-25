import type { EmailAddress } from './email-address'

import type { Observable } from 'rxjs'

export type Email = {
  to: EmailAddress
  from: EmailAddress
  subject: string
  body: string
  isHtml: boolean
}

export type VerificationRequest = {
  to: EmailAddress
  code?: string
}

export type VerificationAttempt = {
  to: EmailAddress
  code: string
  attempt: string
}

export type VerificationResult = {
  status: 'verified' | 'failed'
}

export type Sender = {
  send: (email: Email) => Promise<void>
  requestVerification: (request: VerificationRequest) => Observable<void>
  verify: (attempt: VerificationAttempt) => Observable<VerificationResult>
}

export type EmailBackend = {
  send: (email: Email) => Promise<void>
  requestVerification: (request: VerificationRequest) => Observable<void>
  verify: (attempt: VerificationAttempt) => Observable<VerificationResult>
}
