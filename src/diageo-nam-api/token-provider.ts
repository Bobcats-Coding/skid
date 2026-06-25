import type { TokenProvider } from './types'

import type { Observable } from 'rxjs'
import { of } from 'rxjs'
import { map, shareReplay, tap } from 'rxjs/operators'

const REFRESH_BUFFER_MS = 30_000

export type TokenFetchResult = {
  access_token: string
  expires_in: number
}

export type TokenFetcher = () => Observable<TokenFetchResult>

type CachedToken = {
  token: string
  expiresAt: number
}

type TokenProviderOptions = {
  now?: () => number
}

export const createTokenProvider = (
  fetchToken: TokenFetcher,
  options: TokenProviderOptions = {},
): TokenProvider => {
  const now = options.now ?? Date.now
  let cached: CachedToken | null = null
  let inflight$: Observable<string> | null = null

  const startRefresh = (): Observable<string> => {
    if (inflight$ !== null) return inflight$
    const shared$ = fetchToken().pipe(
      tap(({ access_token: accessToken, expires_in: expiresIn }) => {
        cached = { token: accessToken, expiresAt: now() + expiresIn * 1000 }
      }),
      map(({ access_token: accessToken }) => accessToken),
      shareReplay({ bufferSize: 1, refCount: false }),
    )
    inflight$ = shared$
    shared$.subscribe({
      complete: () => {
        if (inflight$ === shared$) inflight$ = null
      },
      error: () => {
        if (inflight$ === shared$) inflight$ = null
      },
    })
    return shared$
  }

  return {
    getToken: () => {
      if (cached !== null && now() < cached.expiresAt - REFRESH_BUFFER_MS) {
        return of(cached.token)
      }
      return startRefresh()
    },
    invalidate: () => {
      cached = null
      inflight$ = null
    },
  }
}
