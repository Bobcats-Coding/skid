import { type DiageoNamAPIClient } from './api'
import { createDiageoNamService } from './service'
import { createDiageoNamStubAPIClient, diageoNamAPIClient } from './stub'
import {
  DiageoNamAuthError,
  DiageoNamPermanentError,
  DiageoNamTransientError,
  DiageoNamWafError,
  type InboundSubmissionPayload,
  type TokenProvider,
} from './types'

import { firstValueFrom, of, throwError } from 'rxjs'
import { describe, expect, it, vi } from 'vitest'

const SAMPLE_PAYLOAD: InboundSubmissionPayload = {
  ContactKey: 'fake@example.com',
  EventDefinitionKey: 'APIEvent-af8c5e50-f91f-2f85-c057-d13d60054427',
  Data: {
    SubscriberKey: 'fake@example.com',
    EmailAddress: 'fake@example.com',
    FirstName: 'Test',
    LastName: 'User',
    DateOfBirth: '1990-01-01',
    PostCode: '10001',
    PhoneNumber: '',
    Emailable: true,
    Country: 'US',
    Province: '',
    PrivacyPolicyVersion: '14.0',
    Brand: 'Casamigos',
    BrandAbbreviation: 'CAS',
    EntrySource: 'US_CAS_TEST_FY26_Bars.com',
    TDGlobalID: '',
    TDSSCID: '',
    AdditionalField1: '',
    AdditionalValue1: '',
    AdditionalField2: '',
    AdditionalValue2: '',
    AdditionalField3: '',
    AdditionalValue3: '',
    AdditionalField4: '',
    AdditionalValue4: '',
    AdditionalField5: '',
    AdditionalValue5: '',
  },
}

const TEST_CONFIG = { clientId: 'test-client-id', clientSecret: 'test-client-secret' }

const staticTokenProvider = (): TokenProvider => ({
  getToken: () => of('fake-diageo-access-token'),
  invalidate: vi.fn(),
})

describe('createDiageoNamService', () => {
  describe('happy path (stub)', () => {
    it('fetches a token then POSTs the payload and emits success', async () => {
      const service = createDiageoNamService(diageoNamAPIClient, TEST_CONFIG)

      const result = await firstValueFrom(service.submitInbound(SAMPLE_PAYLOAD))

      expect(result.status).toBe('success')
      expect(result.messageId).toBe('fake-diageo-message-id')
    })
  })

  describe('error classification', () => {
    it('throws DiageoNamPermanentError when the inbound body indicates an error', async () => {
      const stub = createDiageoNamStubAPIClient([{}, { response: { error: 'invalid payload' } }])
      const service = createDiageoNamService(stub, TEST_CONFIG, {
        tokenProvider: staticTokenProvider(),
      })

      await expect(firstValueFrom(service.submitInbound(SAMPLE_PAYLOAD))).rejects.toBeInstanceOf(
        DiageoNamPermanentError,
      )
    })

    it('throws DiageoNamPermanentError when the body has status=error', async () => {
      const stub = createDiageoNamStubAPIClient([
        {},
        { response: { status: 'error', message: 'rejected' } },
      ])
      const service = createDiageoNamService(stub, TEST_CONFIG, {
        tokenProvider: staticTokenProvider(),
      })

      await expect(firstValueFrom(service.submitInbound(SAMPLE_PAYLOAD))).rejects.toBeInstanceOf(
        DiageoNamPermanentError,
      )
    })

    it('propagates DiageoNamWafError without retrying', async () => {
      const wafError = new DiageoNamWafError('WAF block', 'support-id-xyz')
      const apiClient = vi
        .fn()
        .mockReturnValue(throwError(() => wafError)) as unknown as DiageoNamAPIClient
      const tokenProvider = staticTokenProvider()
      const service = createDiageoNamService(apiClient, TEST_CONFIG, { tokenProvider })

      await expect(firstValueFrom(service.submitInbound(SAMPLE_PAYLOAD))).rejects.toMatchObject({
        name: 'DiageoNamWafError',
        supportId: 'support-id-xyz',
      })
      expect(apiClient).toHaveBeenCalledTimes(1)
    })

    it('invalidates the token on 401 and retries', async () => {
      let count = 0
      const apiClient = vi.fn().mockImplementation(() => {
        count += 1
        if (count === 1) {
          return throwError(() => new DiageoNamAuthError('Unauthorized'))
        }
        return of({ status: 'success', messageId: 'after-refresh' })
      }) as unknown as DiageoNamAPIClient
      const tokenProvider = staticTokenProvider()
      const service = createDiageoNamService(apiClient, TEST_CONFIG, { tokenProvider })

      const result = await firstValueFrom(service.submitInbound(SAMPLE_PAYLOAD))

      expect(result.status).toBe('success')
      expect(result.messageId).toBe('after-refresh')
      expect(tokenProvider.invalidate).toHaveBeenCalled()
      expect(apiClient).toHaveBeenCalledTimes(2)
    }, 10_000)

    it('retries on DiageoNamTransientError then succeeds', async () => {
      let count = 0
      const apiClient = vi.fn().mockImplementation(() => {
        count += 1
        if (count <= 2) {
          return throwError(() => new DiageoNamTransientError(`5xx attempt ${count}`))
        }
        return of({ status: 'success', messageId: 'after-retries' })
      }) as unknown as DiageoNamAPIClient
      const service = createDiageoNamService(apiClient, TEST_CONFIG, {
        tokenProvider: staticTokenProvider(),
      })

      const result = await firstValueFrom(service.submitInbound(SAMPLE_PAYLOAD))

      expect(result.status).toBe('success')
      expect(apiClient).toHaveBeenCalledTimes(3)
    }, 10_000)

    it('gives up after exceeding max transient retries', async () => {
      const apiClient = vi
        .fn()
        .mockReturnValue(
          throwError(() => new DiageoNamTransientError('persistent 5xx')),
        ) as unknown as DiageoNamAPIClient
      const service = createDiageoNamService(apiClient, TEST_CONFIG, {
        tokenProvider: staticTokenProvider(),
      })

      await expect(firstValueFrom(service.submitInbound(SAMPLE_PAYLOAD))).rejects.toBeInstanceOf(
        DiageoNamTransientError,
      )
      // 1 initial + 3 retries = 4 attempts
      expect(apiClient).toHaveBeenCalledTimes(4)
    }, 15_000)
  })
})
