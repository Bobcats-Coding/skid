import type { EmailBackend, Sender } from './types'

import { catchError, throwError } from 'rxjs'

export const createSender = (emailBackend: EmailBackend): Sender => {
  return {
    send: async (email) => {
      try {
        await emailBackend.send(email)
      } catch (error) {
        throw new Error('Email sending backend failed', { cause: error })
      }
    },
    requestVerification: (request) => {
      return emailBackend
        .requestVerification(request)
        .pipe(
          catchError((error) =>
            throwError(() => new Error('Email verification request failed', { cause: error })),
          ),
        )
    },
    verify: (attempt) => {
      return emailBackend
        .verify(attempt)
        .pipe(
          catchError((error) =>
            throwError(() => new Error('Email verification failed', { cause: error })),
          ),
        )
    },
  }
}
