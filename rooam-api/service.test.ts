import { createRooamService } from './service'
import { rooamAPIClient } from './stub'
import type { CheckStatus, OpenCheckResult } from './types'

import { coreMarbles } from '@bobcats-coding/skid/core/marbles'

import { filter } from 'rxjs/operators'

const rooamService = createRooamService(rooamAPIClient, {
  apiUrl: 'test.rooam.co',
  password: 'test-password',
  username: 'test-user',
})

describe('RooamApiClient', () => {
  describe('openCheck', () => {
    it(
      'Should return the mapped response',
      coreMarbles(({ expect }) => {
        const check$ = rooamService
          .openCheck(
            {
              partnerId: 'partner123',
              idempotencyKey: 'random-string',
            },
            {
              items: [
                {
                  productId: 'item-id-123',
                  groupId: 'item-group-id-123',
                  qty: 1,
                },
              ],
              payment: {
                amount: 1000,
                tip: 200,
              }
            },
          )
          .pipe(
            filter((checkResponse): checkResponse is OpenCheckResult => {
              return checkResponse !== null
            }),
          )

        expect(check$).toBeObservable('-(n|)', {
          n: {
            id: 'fake-check-id',
            status: 'accepted',
          },
        })
      }),
    )
  })

  describe('getCheckStatus', () => {
    it(
      'Should return the mapped response',
      coreMarbles(({ expect }) => {
        const checkStatus$ = rooamService.getCheckStatus('check123').pipe(
          filter((response): response is CheckStatus => {
            return response !== null
          }),
        )

        expect(checkStatus$).toBeObservable('-(n|)', {
          n: {
            message: 'Submitted to POS',
            status: 'submitted',
            timestamp: 123455678,
          },
        })
      }),
    )
  })
})
