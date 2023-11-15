import { createGetCheckStatusRequest, createOpenCheckRequest, type RooamAPIClient } from './api'
import type { RooamBaseParams, RooamService } from './types'

import { map } from 'rxjs/operators'

export const createRooamService = (
  rooamAPIClient: RooamAPIClient,
  baseParams: RooamBaseParams,
): RooamService => {
  return {
    openCheck: (config, checkParams) => {
      return rooamAPIClient(
        createOpenCheckRequest({
          ...baseParams,
          partnerId: config.partnerId,
          idempotencyKey: config.idempotencyKey,
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
                })),
              }),
            })),
            ...(checkParams.discount !== undefined && {
              discount: {
                amount: checkParams.discount,
              },
            }),
            ...(checkParams.payment !== undefined && {
              payment: {
                amount: checkParams.payment.amount,
                tip: checkParams.payment.tip,
              },
            }),
          },
        }),
      ).pipe(
        map((response) => {
          if (!('status' in response)) {
            throw new Error(response.message)
          }
          if (response.status === 'error') {
            throw new Error(response.message)
          }
          return {
            id: response.request_id,
            status: response.status,
          }
        }),
      )
    },
    getCheckStatus: (id) => {
      return rooamAPIClient(
        createGetCheckStatusRequest({
          ...baseParams,
          requestId: id,
        }),
      ).pipe(
        map((response) => {
          if (!('status' in response) || response.status === 'ERROR') {
            throw new Error(response.message)
          }
          return {
            message: response.message,
            timestamp: response.timestamp,
            status: response.status === 'SUBMITTED' ? 'submitted' : 'pending',
          }
        }),
      )
    },
  }
}
