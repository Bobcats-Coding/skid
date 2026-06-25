import { createTokenProvider, type TokenFetchResult } from './token-provider'

import { firstValueFrom, of, Subject, throwError } from 'rxjs'
import { describe, expect, it, vi } from 'vitest'

describe('createTokenProvider', () => {
  it('fetches a token on the first getToken() call', async () => {
    const fetchToken = vi.fn().mockReturnValue(of({ access_token: 'token-1', expires_in: 3600 }))
    const provider = createTokenProvider(fetchToken)

    const token = await firstValueFrom(provider.getToken())

    expect(token).toBe('token-1')
    expect(fetchToken).toHaveBeenCalledTimes(1)
  })

  it('returns the cached token on subsequent calls without refetching', async () => {
    const fetchToken = vi.fn().mockReturnValue(of({ access_token: 'token-1', expires_in: 3600 }))
    const provider = createTokenProvider(fetchToken)

    await firstValueFrom(provider.getToken())
    await firstValueFrom(provider.getToken())
    await firstValueFrom(provider.getToken())

    expect(fetchToken).toHaveBeenCalledTimes(1)
  })

  it('keeps using the cached token while within the refresh buffer window', async () => {
    let currentTime = 1_000_000_000_000
    const fetchToken = vi.fn().mockReturnValue(of({ access_token: 'token-1', expires_in: 60 }))
    const provider = createTokenProvider(fetchToken, { now: () => currentTime })

    await firstValueFrom(provider.getToken())
    // Advance 29.999s: still within cache, 30.001s remain until expiry (>30s buffer).
    currentTime += 29_999
    await firstValueFrom(provider.getToken())

    expect(fetchToken).toHaveBeenCalledTimes(1)
  })

  it('refetches when within 30s of expiry', async () => {
    let currentTime = 1_000_000_000_000
    let counter = 0
    const fetchToken = vi.fn().mockImplementation(() => {
      counter += 1
      return of({ access_token: `token-${counter}`, expires_in: 60 })
    })
    const provider = createTokenProvider(fetchToken, { now: () => currentTime })

    const first = await firstValueFrom(provider.getToken())
    expect(first).toBe('token-1')

    // Advance to exactly the refresh boundary (expiresAt - 30s).
    currentTime += 30_000
    const second = await firstValueFrom(provider.getToken())

    expect(second).toBe('token-2')
    expect(fetchToken).toHaveBeenCalledTimes(2)
  })

  it('invalidate() forces the next getToken() to refetch', async () => {
    let counter = 0
    const fetchToken = vi.fn().mockImplementation(() => {
      counter += 1
      return of({ access_token: `token-${counter}`, expires_in: 3600 })
    })
    const provider = createTokenProvider(fetchToken)

    const first = await firstValueFrom(provider.getToken())
    expect(first).toBe('token-1')

    provider.invalidate()

    const second = await firstValueFrom(provider.getToken())
    expect(second).toBe('token-2')
    expect(fetchToken).toHaveBeenCalledTimes(2)
  })

  it('coalesces concurrent callers into a single fetch', async () => {
    const subject = new Subject<TokenFetchResult>()
    const fetchToken = vi.fn().mockReturnValue(subject.asObservable())
    const provider = createTokenProvider(fetchToken)

    const promises = [
      firstValueFrom(provider.getToken()),
      firstValueFrom(provider.getToken()),
      firstValueFrom(provider.getToken()),
    ]

    subject.next({ access_token: 'shared-token', expires_in: 3600 })
    subject.complete()

    const tokens = await Promise.all(promises)
    expect(tokens).toEqual(['shared-token', 'shared-token', 'shared-token'])
    expect(fetchToken).toHaveBeenCalledTimes(1)
  })

  it('allows a fresh fetch after a previous fetch fails', async () => {
    let counter = 0
    const fetchToken = vi.fn().mockImplementation(() => {
      counter += 1
      if (counter === 1) {
        return throwError(() => new Error('boom'))
      }
      return of({ access_token: 'token-2', expires_in: 3600 })
    })
    const provider = createTokenProvider(fetchToken)

    await expect(firstValueFrom(provider.getToken())).rejects.toThrow('boom')

    const token = await firstValueFrom(provider.getToken())
    expect(token).toBe('token-2')
    expect(fetchToken).toHaveBeenCalledTimes(2)
  })
})
