import type { Sender, SMSBackend } from './types'

import { catchError, throwError } from 'rxjs'
import { PhoneNumber } from 'twilio/lib/interfaces'

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
