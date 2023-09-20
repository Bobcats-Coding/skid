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
      if (!isPhoneNumberValid(request.to)) {
        return throwError(() => new Error('Phone number must conform the E.164 format'))
      }
      return smsBackend
        .requestVerification(request)
        .pipe(
          catchError((error) =>
            throwError(() => new Error('SMS verification request failed', { cause: error })),
          ),
        )
    },
    verify: (attempt) => {
      if (!isPhoneNumberValid(attempt.to)) {
        return throwError(() => new Error('Phone number must conform the E.164 format'))
      }
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

const isPhoneNumberValid = (phoneNumber: PhoneNumber): boolean => {
  return /^\+[1-9]\d{1,14}$/.test(phoneNumber.toString())
}
