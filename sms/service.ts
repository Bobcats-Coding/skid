import type { Observable } from 'rxjs'
import { catchError, throwError } from 'rxjs'

type PhoneNumber = string

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
  requestVerification: (request: VerificationRequest) => Observable<void>
  verify: (attempt: VerificationAttempt) => Observable<VerificationResult>
}

export type SMSBackend = {
  requestVerification: (request: VerificationRequest) => Observable<void>
  verify: (attempt: VerificationAttempt) => Observable<VerificationResult>
}

export const createSender = (smsBackend: SMSBackend): Sender => {
  return {
    requestVerification: (request) => {
      return smsBackend
        .requestVerification(request)
        .pipe(
          catchError((error) =>
            throwError(() => new Error('SMS verification request failed', { cause: error })),
          ),
        )
    },
    verify: (attempt) => {
      return smsBackend
        .verify(attempt)
        .pipe(
          catchError((error) =>
            throwError(() => new Error('SMS verification failed', { cause: error })),
          ),
        )
    },
  }
}
