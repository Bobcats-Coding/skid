import { createInboundSubmissionRequest, createTokenRequest } from './api'
import { createTokenProvider } from './token-provider'
import {
  DiageoNamAuthError,
  DiageoNamPermanentError,
  type DiageoNamServiceCreator,
  DiageoNamTransientError,
  type InboundSubmissionPayload,
  type InboundSubmissionResult,
  type TokenProvider,
} from './types'

import { type MonoTypeOperatorFunction, type Observable, throwError, timer } from 'rxjs'
import { catchError, map, mergeMap, retry } from 'rxjs/operators'

const MAX_TRANSIENT_RETRY_ATTEMPTS = 3
const TRANSIENT_RETRY_INITIAL_DELAY_MS = 500

const createTransientRetryOperator = <T>(): MonoTypeOperatorFunction<T> =>
  retry<T>({
    count: MAX_TRANSIENT_RETRY_ATTEMPTS,
    delay: (error, retryCount) => {
      const isTransient =
        error instanceof DiageoNamTransientError || error instanceof DiageoNamAuthError
      if (!isTransient) {
        throw error
      }
      const attemptIndex = retryCount - 1
      const delayMs = TRANSIENT_RETRY_INITIAL_DELAY_MS * (attemptIndex + 1)
      return timer(delayMs)
    },
    resetOnSuccess: true,
  })

const isTokenResponse = (
  response: unknown,
): response is { access_token: string; expires_in: number } => {
  return (
    typeof response === 'object' &&
    response !== null &&
    'access_token' in response &&
    typeof (response as { access_token?: unknown }).access_token === 'string' &&
    'expires_in' in response &&
    typeof (response as { expires_in?: unknown }).expires_in === 'number'
  )
}

// Returns a JSON string of the response with any `access_token` field redacted
// so failure logs never carry a working Bearer credential.
const stringifyTokenResponseForLog = (response: unknown): string => {
  if (typeof response !== 'object' || response === null) {
    return JSON.stringify(response)
  }
  const clone: Record<string, unknown> = { ...(response as Record<string, unknown>) }
  if ('access_token' in clone) {
    clone['access_token'] = '[REDACTED]'
  }
  return JSON.stringify(clone)
}

const looksLikeError = (response: unknown): boolean => {
  if (typeof response !== 'object' || response === null) return true
  if ('error' in response) return true
  if ('status' in response) {
    const status = (response as { status?: unknown }).status
    if (typeof status === 'string' && status.toLowerCase() === 'error') return true
  }
  return false
}

const extractMessageId = (response: unknown): string | undefined => {
  if (typeof response !== 'object' || response === null) return undefined
  const messageId = (response as { messageId?: unknown }).messageId
  return typeof messageId === 'string' ? messageId : undefined
}

export const createDiageoNamService: DiageoNamServiceCreator = (apiClient, config, options) => {
  const tokenProvider: TokenProvider =
    options?.tokenProvider ??
    createTokenProvider(() =>
      apiClient(
        createTokenRequest({ clientId: config.clientId, clientSecret: config.clientSecret }),
      ).pipe(
        map((res) => {
          if (!isTokenResponse(res)) {
            console.error(
              '[DiageoNAM] Unexpected token response',
              stringifyTokenResponseForLog(res),
            )
            throw new DiageoNamTransientError(
              '[DiageoNAM] Token endpoint returned unexpected payload',
              res,
            )
          }
          return { access_token: res.access_token, expires_in: res.expires_in }
        }),
      ),
    )

  const submit = (payload: InboundSubmissionPayload): Observable<InboundSubmissionResult> =>
    tokenProvider.getToken().pipe(
      mergeMap((token) =>
        apiClient(createInboundSubmissionRequest({ accessToken: token, body: payload })),
      ),
      map((res): InboundSubmissionResult => {
        if (looksLikeError(res)) {
          console.error('[DiageoNAM] Submission body indicates error', JSON.stringify(res))
          throw new DiageoNamPermanentError(
            '[DiageoNAM] Submission rejected by upstream',
            undefined,
            res,
          )
        }
        return {
          status: 'success',
          messageId: extractMessageId(res),
          raw: res,
        }
      }),
      catchError((err) => {
        if (err instanceof DiageoNamAuthError) {
          tokenProvider.invalidate()
        }
        return throwError(() => err)
      }),
    )

  return {
    submitInbound: (payload) =>
      submit(payload).pipe(createTransientRetryOperator<InboundSubmissionResult>()),
  }
}
