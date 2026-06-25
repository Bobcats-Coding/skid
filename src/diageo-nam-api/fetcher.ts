import {
  DiageoNamAuthError,
  DiageoNamPermanentError,
  DiageoNamTransientError,
  DiageoNamWafError,
} from './types'

import type { Fetcher } from '@bobcats-coding/skid/rest/service'

const truncate = (text: string, max = 500): string =>
  text.length > max ? `${text.slice(0, max)}…` : text

// Redacts the access_token from a token-endpoint response body so we don't
// leak a working Bearer credential into the application logs.
const redactAccessToken = (text: string): string =>
  text.replace(/("access_token"\s*:\s*")[^"]*(")/g, '$1[REDACTED]$2')

const sanitizeForLog = (url: string, text: string): string =>
  url.includes('/oauth2/provider/token') ? redactAccessToken(text) : text

const extractSupportId = (text: string): string | undefined => {
  const match = /support\s+ID\s+is\s+([A-Za-z0-9-]+)/i.exec(text)
  return match?.[1]
}

export const testing = { redactAccessToken, sanitizeForLog }

export const diageoNamFetcher: Fetcher<unknown> = async (url, request) => {
  let response: Response
  try {
    response = await fetch(url, {
      ...request,
      headers: {
        ...request.headers,
        ...(request.body !== undefined && { 'Content-Type': 'application/json' }),
      },
      body: request.body !== undefined ? JSON.stringify(request.body) : null,
    })
  } catch (err) {
    throw new DiageoNamTransientError(`[DiageoNAM] Network error: ${(err as Error).message}`, err)
  }

  const status = response.status
  const rawText = await response.text()
  const safeText = sanitizeForLog(response.url, rawText)

  if (!response.ok) {
    console.error('[DiageoNAM]', response.url, status, truncate(safeText))

    if (status === 401) {
      throw new DiageoNamAuthError(`[DiageoNAM] Unauthorized (401): ${truncate(safeText)}`)
    }
    if (status === 403) {
      throw new DiageoNamWafError(
        `[DiageoNAM] WAF rejection (403): ${truncate(safeText)}`,
        extractSupportId(rawText),
      )
    }
    if (status === 429 || status >= 500) {
      throw new DiageoNamTransientError(
        `[DiageoNAM] Transient error (${status}): ${truncate(safeText)}`,
      )
    }
    throw new DiageoNamPermanentError(
      `[DiageoNAM] Request failed (${status}): ${truncate(safeText)}`,
      status,
    )
  }

  console.info('[DiageoNAM]', response.url, status, truncate(safeText))

  if (rawText.trim() === '') return {}
  try {
    return JSON.parse(rawText) as unknown
  } catch (err) {
    throw new DiageoNamPermanentError(
      `[DiageoNAM] Non-JSON 2xx body: ${truncate(rawText)}`,
      status,
      err,
    )
  }
}
