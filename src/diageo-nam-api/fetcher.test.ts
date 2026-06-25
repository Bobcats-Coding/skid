import { testing } from './fetcher'

import { describe, expect, it } from 'vitest'

const { redactAccessToken, sanitizeForLog } = testing

describe('redactAccessToken', () => {
  it('replaces the access_token value with [REDACTED]', () => {
    const body = '{"access_token":"q-awgZz5sRJcmdyTAI7bS","token_type":"Bearer","expires_in":3600}'
    expect(redactAccessToken(body)).toBe(
      '{"access_token":"[REDACTED]","token_type":"Bearer","expires_in":3600}',
    )
  })

  it('handles surrounding whitespace inside the JSON', () => {
    const body = '{"access_token" : "secret-value","expires_in":3600}'
    expect(redactAccessToken(body)).toBe('{"access_token" : "[REDACTED]","expires_in":3600}')
  })

  it('is a no-op when there is no access_token field', () => {
    const body = '{"error":"invalid_client"}'
    expect(redactAccessToken(body)).toBe(body)
  })
})

describe('sanitizeForLog', () => {
  it('redacts access_token on the token endpoint URL', () => {
    const url = 'https://dev.api.diageo.com/diageo/common/oauth2/provider/token'
    const body = '{"access_token":"abc","expires_in":3600}'
    expect(sanitizeForLog(url, body)).toBe('{"access_token":"[REDACTED]","expires_in":3600}')
  })

  it('passes the inbound endpoint body through unchanged', () => {
    const url = 'https://dev.api.diageo.com/global/tdcdp/common/eapi/api/inbound/sfmc'
    const body = '{"Status":"Success","Message":"NAM Flow completed successfully"}'
    expect(sanitizeForLog(url, body)).toBe(body)
  })
})
