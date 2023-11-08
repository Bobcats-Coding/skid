import { map } from 'rxjs'
import { createOpenCheckRequest, type RooamAPIClient } from './api'
import type { RooamBaseParams, RooamService } from './types'

export const createRoamService = (
  rooamAPIClient: RooamAPIClient,
  baseParams: RooamBaseParams,
): RooamService => {
  return {
    openCheck: (checkParams) => {
      return rooamAPIClient(createOpenCheckRequest({
        ...baseParams,
        partnerId: checkParams.partnerId,
        body: {
          ...(checkParams.name !== undefined && { check_name: checkParams.name }),
          ...(checkParams.guestCount !== undefined && { quest_count: checkParams.guestCount }),
          items: checkParams.items.map((item) => ({
            menu_item_id: item.productId,
            menu_item_group_id: item.groupId,
            quantity: item.qty,
            ...(item.modifiers !== undefined && {
              modifiers: item.modifiers.map((modifier) => ({
                modifier_id: modifier.id,
                modifier_group_id: modifier.groupId,
                quantity: modifier.qty,
              }))
            }),
          })),
          ...(checkParams.discount !== undefined && {
            discount: {
              amount: checkParams.discount
            }
          }),
          ...(checkParams.payment !== undefined && {
            payment: {
              amount: checkParams.payment.amount,
              tip: checkParams.payment.tip,
            }
          }),
        }
      })).pipe(
        map((response) => {
          if ('message' in response) {
            throw new Error(response.message)
          }
          if ('error' in response) {
            throw new Error(response.error)
          }
          return {
            status: response.status,
            requestId: response.request_id,
          }
        }),
      )
    }
  }
}