import { createJsonRestClient } from '@bobcats-coding/skid/rest/json'
import type { RestEndpoint } from '@bobcats-coding/skid/rest/service'

const VERSION = 'v1'

type RooamHeaders = {
  Authorization: string
  'Idempotency-Key': string
} & Record<string, string>

type RooamError =
  | {
      timestamp: string
      status: number
      error: string
      path: string
    }
  | {
      message: string
    }
  | {
      status: 'ERROR'
      message: string
      timestamp: number
    }

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
        modifier_id: string
        modifier_group_id: string
        quantity: number
      }>
    }>
    discount?: {
      amount: number,
    }
    payment?: {
      amount: number
      tip: number
    }
  }
}

export type OpenCheckResponse = {
  status: 'accepted'
  request_id: string
}

export type OpenCheckEndpoint = RestEndpoint<OpenCheckRequest, OpenCheckResponse | RooamError>

export type GetCheckStatusRequest = {
  method: 'GET'
  pathname: `/${typeof VERSION}/partner/open-checks/${string}/status`
  headers: Omit<RooamHeaders, 'idempotencyKey'>
}

export type GetCheckStatusResponse = {
  status: 'SUBMITTED' | 'ERROR'
  message: string
  timestamp: number
}

export type GetCheckStatusEndpoint = RestEndpoint<
  GetCheckStatusRequest,
  GetCheckStatusResponse | RooamError
>

export type RooamAPI = OpenCheckEndpoint | GetCheckStatusEndpoint

export type RooamAPIClient = ReturnType<typeof createJsonRestClient<RooamAPI>>

export const createRooamApiClient = (apiUrl: string): RooamAPIClient => {
  return createJsonRestClient<RooamAPI>('https', apiUrl)
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
