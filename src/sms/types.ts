import { type PhoneNumber } from './phone-number'

import type { Observable } from 'rxjs'

export type SendMessageRequest = {
  to: PhoneNumber
  content: string
}

export type VerificationRequest = {
  to: PhoneNumber
  code?: string
}

export type VerificationAttempt = {
  to: PhoneNumber
  code: string
}

export type VerificationResult = {
  status: 'verified' | 'failed'
}

export type Sender = {
  sendMessage: (request: SendMessageRequest) => Observable<void>
  requestVerification: (request: VerificationRequest) => Observable<void>
  verify: (attempt: VerificationAttempt) => Observable<VerificationResult>
}

export type SMSBackend = {
  sendMessage: (request: SendMessageRequest) => Observable<void>
  requestVerification: (request: VerificationRequest) => Observable<void>
  verify: (attempt: VerificationAttempt) => Observable<VerificationResult>
}
