import {
  createGetCheckStatusRequest,
  createGetGroupsRequest,
  createGetOrderPricePreviewRequest,
  createGetProductsByGroupRequest,
  createOpenCheckRequest,
} from './api'
import type { Group, Modifier, Product, RooamServiceCreator } from './types'

import type { MonoTypeOperatorFunction, Observable } from 'rxjs'
import { timer } from 'rxjs'
import { map, retry } from 'rxjs/operators'

const MAX_TRANSIENT_RETRY_ATTEMPTS = 3
const TRANSIENT_RETRY_INITIAL_DELAY_MS = 500

class RooamTransientError extends Error {
  readonly isTransient = true

  constructor(message: string, cause?: unknown) {
    super(message)
    this.name = 'RooamTransientError'
    if (cause !== undefined) {
      ;(this as { cause?: unknown }).cause = cause
    }
  }
}

type RooamErrorResponse = {
  status: string
  message?: string
}

const isRooamErrorResponse = (response: unknown): response is RooamErrorResponse => {
  return (
    typeof response === 'object' &&
    response !== null &&
    'status' in response &&
    typeof (response as { status?: unknown }).status === 'string' &&
    (response as { status: string }).status.toUpperCase() === 'ERROR'
  )
}

const createTransientRetryOperator = <T>(): MonoTypeOperatorFunction<T> =>
  retry<T>({
    count: MAX_TRANSIENT_RETRY_ATTEMPTS,
    delay: (error, retryCount) => {
      if (!(error instanceof RooamTransientError)) {
        throw error
      }
      const attemptIndex = retryCount - 1
      const delayMs = TRANSIENT_RETRY_INITIAL_DELAY_MS * (attemptIndex + 1)
      return timer(delayMs)
    },
    resetOnSuccess: true,
  })

export const createRooamService: RooamServiceCreator = (rooamAPIClient, baseParams) => {
  function getProductsByGroup(params: {
    partnerId: string
    groupId?: string
  }): Observable<Product[]> {
    return rooamAPIClient(
      createGetProductsByGroupRequest({
        ...baseParams,
        ...params,
      }),
    ).pipe(
      map((response) => {
        if (isRooamErrorResponse(response)) {
          console.warn(
            "[Rooam] Transient error - Couldn't get products by group:",
            JSON.stringify(response),
          )
          throw new RooamTransientError('Failed to get products', response)
        }

        if (!('menu_items' in response)) {
          console.error("[Rooam] Error - Couldn't get products by group:", JSON.stringify(response))
          throw new Error('Failed to get products')
        }

        return response.menu_items.map((product) => ({
          id: product.menu_item_id,
          groupId: product.menu_item_group_id,
          name: product.name,
          price: product.price_per_unit,
          modifiers: product.option_sets.reduce<Modifier[]>(
            (modifiers, modifierGroup) => [
              ...modifiers,
              ...modifierGroup.available_options.map((modifier) => ({
                modifierGroupId: modifierGroup.option_set_id,
                modifierGroupName: modifierGroup.name,
                modifierId: modifier.option_id,
                name: modifier.option_name,
                price: modifier.option_price_per_unit,
              })),
            ],
            [],
          ),
        }))
      }),
      createTransientRetryOperator<Product[]>(),
    )
  }

  function getGroups(params: { partnerId: string }): Observable<Group[]> {
    return rooamAPIClient(
      createGetGroupsRequest({
        ...baseParams,
        ...params,
      }),
    ).pipe(
      map((response) => {
        if (isRooamErrorResponse(response)) {
          console.warn("[Rooam] Transient error - Couldn't get groups:", JSON.stringify(response))
          throw new RooamTransientError('Failed to get groups', response)
        }

        if (!('menu_item_groups' in response)) {
          console.error("[Rooam] Error - Couldn't get groups:", JSON.stringify(response))
          throw new Error('Failed to get groups')
        }

        return response.menu_item_groups
      }),
      createTransientRetryOperator<Group[]>(),
    )
  }

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
              ...(item.modifiers !== undefined &&
                item.modifiers.every(
                  (modifier) =>
                    modifier.modifierId !== null &&
                    modifier.modifierId !== '' &&
                    modifier.groupId !== null &&
                    modifier.groupId !== '',
                ) && {
                  modifiers: item.modifiers.map((modifier) => ({
                    modifier_id: modifier.modifierId,
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
            ...(checkParams.serviceCharge !== undefined && {
              service_charge: checkParams.serviceCharge,
            }),
          },
        }),
      ).pipe(
        map((response) => {
          if (!('status' in response)) {
            console.error("[Rooam] Error - Couldn't open check:", JSON.stringify(response))
            throw new Error(response.message)
          }
          if (response.status === 'error') {
            console.error("[Rooam] Error - Couldn't open check:", JSON.stringify(response))
            throw new Error(response.message)
          }
          return {
            id: response.request_id,
            status: response.status,
            orderNumber: checkParams.name,
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
            console.error("[Rooam] Error - Couldn't get check status:", JSON.stringify(response))
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
    getOrderPricePreview: (params) => {
      return rooamAPIClient(
        createGetOrderPricePreviewRequest({
          ...baseParams,
          partnerId: params.partnerId,
          idempotencyKey: params.idempotencyKey,
          body: {
            order_type: params.orderTypeId,
            items: [
              {
                id: params.id,
                group_id: params.groupId,
                quantity: 1,
                options: params.modifiers.map((modifier) => ({
                  id: modifier.modifierId,
                  group_id: modifier.modifierGroupId,
                })),
              },
            ],
          },
        }),
      ).pipe(
        map((response) => {
          if (!('totals' in response)) {
            console.error(
              "[Rooam] Error - Couldn't get order price preview:",
              JSON.stringify(response),
            )
            throw new Error('Failed to get prices')
          }
          return {
            productPrice: response.totals.sub_total,
            serviceCharge: response.totals.total - response.totals.tax - response.totals.sub_total,
            taxAmount: response.totals.tax,
            total: response.totals.total,
          }
        }),
      )
    },
    getProductsByGroup,
    getGroups,
    getProductByIdAndGroup: (params) => {
      return getProductsByGroup(params).pipe(
        map((products) => {
          const product = products.find((product) => product.id === params.id)

          if (product === undefined) {
            console.error("[Rooam] Error - Couldn't find product:", JSON.stringify(params))
            throw new Error('Product not found!')
          }

          return product
        }),
      )
    },
  }
}
