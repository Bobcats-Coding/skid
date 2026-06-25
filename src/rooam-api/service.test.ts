import { createRooamService } from './service'
import { rooamAPIClient } from './stub'
import type { CheckStatus, OpenCheckResult, OrderPricePreview, Product } from './types'

import { coreMarbles } from '@bobcats-coding/skid/core/marbles-vitest'

import { filter } from 'rxjs/operators'
import { describe, it } from 'vitest'

const rooamService = createRooamService(rooamAPIClient, {
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
              name: 'check-name',
              items: [
                {
                  productId: 'item-id-123',
                  groupId: 'item-group-id-123',
                  qty: 1,
                },
              ],
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
            orderNumber: 'check-name',
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

  describe('getItemsByGroup', () => {
    it(
      'Should return the mapped response',
      coreMarbles(({ expect }) => {
        const products$ = rooamService
          .getProductsByGroup({
            partnerId: 'partner123',
            groupId: 'item-group-id-123',
          })
          .pipe(
            filter((response): response is Product[] => {
              return response !== null
            }),
          )

        expect(products$).toBeObservable('-(n|)', {
          n: [
            {
              id: 'item-id-123',
              groupId: 'item-group-id-123',
              name: 'fake-name',
              price: 1200,
              modifiers: [
                {
                  modifierGroupId: 'modifier-group-id-123',
                  modifierGroupName: 'fake-modifier-group',
                  modifierId: 'modifier-id-123',
                  name: 'fake-modifier-name',
                  price: 100,
                },
              ],
            },
          ],
        })
      }),
    )
  })

  describe('getOrderPricePreview', () => {
    it(
      'Should return the mapped response',
      coreMarbles(({ expect }) => {
        const pricePreview$ = rooamService
          .getOrderPricePreview({
            partnerId: 'partner123',
            idempotencyKey: 'random-string',
            orderTypeId: 'random-uuid',
            id: 'item-id-123',
            groupId: 'item-group-id-123',
            modifiers: [],
          })
          .pipe(
            filter((response): response is OrderPricePreview => {
              return response !== null
            }),
          )

        expect(pricePreview$).toBeObservable('-(n|)', {
          n: {
            total: 121,
            taxAmount: 11,
            productPrice: 100,
            serviceCharge: 10,
          },
        })
      }),
    )
  })
})
