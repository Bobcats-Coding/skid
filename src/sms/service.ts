import type { Sender, SMSBackend } from './types'

import { catchError, throwError } from 'rxjs'

export const createSender = (smsBackend: SMSBackend): Sender => {
  return {
    sendMessage: (request) => {
      return smsBackend
        .sendMessage(request)
        .pipe(
          catchError((error) =>
            throwError(() => new Error('SMS sending failed', { cause: error })),
          ),
        )
    },
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
