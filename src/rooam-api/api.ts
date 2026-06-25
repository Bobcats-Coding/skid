import { createJsonRestClient } from '@bobcats-coding/skid/rest/json'
import type { RestEndpoint } from '@bobcats-coding/skid/rest/service'

const VERSION = 'v1'

type RooamHeaders = {
  Authorization: string
  'Idempotency-Key': string
} & Record<string, string>

export type GetOrderPricePreviewRequest = {
  method: 'POST'
  pathname: `/${typeof VERSION}/partner/${string}/prices`
  headers: RooamHeaders
  body: {
    order_type: string
    items: Array<{
      id: string
      group_id: string
      quantity: number
      options: Array<{
        group_id: string
        id: string
      }>
    }>
  }
}

export type GetOrderPricePreviewResponse =
  | {
      totals: {
        items: number
        sub_total: number
        tax: number
        total: number
      }
    }
  | {
      timestamp: string
      status: number
      error: string
      path: string
    }

export type GetOrderPricePreviewEndpoint = RestEndpoint<
  GetOrderPricePreviewRequest,
  GetOrderPricePreviewResponse
>

export type OpenCheckRequest = {
  method: 'POST'
  pathname: `/${typeof VERSION}/partner/${string}/checks`
  headers: RooamHeaders
  body: {
    check_name?: string
    quest_count?: number
    items: Array<{
      menu_item_id: string
      menu_item_group_id: string
      quantity: number
      modifiers?: Array<{
        modifier_id: string | undefined
        modifier_group_id: string | undefined
        quantity: number | undefined
      }>
    }>
    service_charge?: {
      amount: number
    }
    discount?: {
      amount: number
    }
    payment?: {
      amount: number
      tip: number
    }
  }
}

export type OpenCheckResponse =
  | {
      status: 'accepted'
      request_id: string
    }
  | {
      status: 'error'
      request_id: string
      message: string
    }
  | {
      message: string
    }

export type OpenCheckEndpoint = RestEndpoint<OpenCheckRequest, OpenCheckResponse>

export type GetCheckStatusRequest = {
  method: 'GET'
  pathname: `/${typeof VERSION}/partner/open-checks/${string}/status`
  headers: Omit<RooamHeaders, 'idempotencyKey'>
}

export type GetCheckStatusResponse = {
  status: 'SUBMITTED' | 'ERROR' | 'PENDING'
  message: string
  timestamp: number
}

export type GetCheckStatusEndpoint = RestEndpoint<GetCheckStatusRequest, GetCheckStatusResponse>

export type GetProductsByGroupRequest = {
  method: 'GET'
  pathname: `/${typeof VERSION}/partner/${string}/menu/items`
  headers: Omit<RooamHeaders, 'idempotencyKey'>
  search?: {
    group_id: string
  }
}

export type GetProductsByGroupResponse = {
  menu_items: Array<{
    menu_item_id: string
    menu_item_group_id: string
    name: string
    price_per_unit: number
    open: boolean
    option_sets: Array<{
      option_set_id: string
      name: string
      minimum: number
      required: boolean
      available_options: Array<{
        option_id: string
        option_item_group_id: string
        option_name: string
        option_price_per_unit: number
      }>
    }>
  }>
}

export type GetProductsByGroupEndpoint = RestEndpoint<
  GetProductsByGroupRequest,
  GetProductsByGroupResponse
>

export type GetGroupsRequest = {
  method: 'GET'
  pathname: `/${typeof VERSION}/partner/${string}/menu/groups`
  headers: Omit<RooamHeaders, 'idempotencyKey'>
}

export type GetGroupsResponse = {
  menu_item_groups: Array<{
    id: string
    name: string
  }>
}

export type GetGroupsEndpoint = RestEndpoint<GetGroupsRequest, GetGroupsResponse>

export type RooamAPI =
  | OpenCheckEndpoint
  | GetCheckStatusEndpoint
  | GetProductsByGroupEndpoint
  | GetGroupsEndpoint
  | GetOrderPricePreviewEndpoint

export type RooamAPIClient = ReturnType<typeof createJsonRestClient<RooamAPI>>

export const createRooamApiClient = (baseUrl: string): RooamAPIClient => {
  return createJsonRestClient<RooamAPI>(baseUrl)
}

type GetOrderPricePreviewRequestParams = {
  partnerId: string
  username: string
  password: string
  idempotencyKey: string
  body: GetOrderPricePreviewRequest['body']
}

export const createGetOrderPricePreviewRequest = ({
  username,
  password,
  partnerId,
  idempotencyKey,
  body,
}: GetOrderPricePreviewRequestParams): GetOrderPricePreviewRequest => {
  return {
    method: 'POST',
    pathname: `/v1/partner/${partnerId}/prices`,
    headers: {
      Authorization: `Basic ${btoa([username, password].join(':'))}`,
      'Idempotency-Key': idempotencyKey,
    },
    body,
  }
}

type OpenCheckRequestParams = {
  partnerId: string
  username: string
  password: string
  idempotencyKey: string
  body: OpenCheckRequest['body']
}

export const createOpenCheckRequest = ({
  username,
  password,
  partnerId,
  idempotencyKey,
  body,
}: OpenCheckRequestParams): OpenCheckRequest => {
  return {
    method: 'POST',
    pathname: `/v1/partner/${partnerId}/checks`,
    headers: {
      Authorization: `Basic ${btoa([username, password].join(':'))}`,
      'Idempotency-Key': idempotencyKey,
    },
    body,
  }
}

type GetCheckStatusRequestParams = {
  requestId: string
  username: string
  password: string
}

export const createGetCheckStatusRequest = ({
  requestId,
  username,
  password,
}: GetCheckStatusRequestParams): GetCheckStatusRequest => {
  return {
    method: 'GET',
    pathname: `/v1/partner/open-checks/${requestId}/status`,
    headers: {
      Authorization: `Basic ${btoa([username, password].join(':'))}`,
    },
  }
}

type GetProductsByGroupRequestParams = {
  username: string
  password: string
  partnerId: string
  groupId?: string
}

export const createGetProductsByGroupRequest = ({
  username,
  password,
  partnerId,
  groupId,
}: GetProductsByGroupRequestParams): GetProductsByGroupRequest => {
  const req: GetProductsByGroupRequest = {
    method: 'GET',
    pathname: `/v1/partner/${partnerId}/menu/items`,
    headers: {
      Authorization: `Basic ${btoa([username, password].join(':'))}`,
    },
  }
  if (groupId !== undefined) {
    req.search = {
      group_id: groupId,
    }
  }
  return req
}

type GetGroupsRequestParams = {
  username: string
  password: string
  partnerId: string
}

export const createGetGroupsRequest = ({
  username,
  password,
  partnerId,
}: GetGroupsRequestParams): GetGroupsRequest => {
  const req: GetGroupsRequest = {
    method: 'GET',
    pathname: `/v1/partner/${partnerId}/menu/groups`,
    headers: {
      Authorization: `Basic ${btoa([username, password].join(':'))}`,
    },
  }
  return req
}
