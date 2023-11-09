import { type createJsonRestClient } from '@bobcats-coding/skid/rest/json'
import type { RestEndpoint } from '@bobcats-coding/skid/rest/service'

const VERSION = 'v1';

type RooamHeaders = {
  Authorization: string,
  'Idempotency-Key': string,
} & Record<string, string>

type RooamError = {
  timestamp: string,
  status: number,
  error: string,
  path: string,
} | {
  message: string,
} | {
  status: 'ERROR',
  message: string,
  timestamp: number
}

type OpenCheckRequest = {
  method: 'POST'
  pathname: `${string}/${typeof VERSION}/partner/${string}/checks`
  headers: RooamHeaders
  body: {
    check_name?: string,
    quest_count?: number,
    items: Array<{
      menu_item_id: string,
      menu_item_group_id: string,
      quantity: number,
      modifiers?: Array<{
        modifier_id: string,
        modifier_group_id: string,
        quantity: number,
      }>,
    }>,
    discount?: {
      amount: number,
    }
    payment?: {
      amount: number,
      tip: number,
    }
  }
}

type OpenCheckResponse = {
  status: 'accepted',
  request_id: string,
}

type OpenCheckEndpoint = RestEndpoint<OpenCheckRequest, OpenCheckResponse | RooamError>

type GetCheckStatusRequest = {
  method: 'GET'
  pathname: `${string}/${typeof VERSION}/partner/open-checks/${string}/status`
  headers: RooamHeaders
}

type GetCheckStatusResponse = {
  status: 'SUBMITTED' | 'ERROR',
  message: string,
  timestamp: number,
}

type GetCheckStatusEndpoint = RestEndpoint<GetCheckStatusRequest, GetCheckStatusResponse | RooamError>

type RooamAPI =
  | OpenCheckEndpoint
  | GetCheckStatusEndpoint

export type RooamAPIClient = ReturnType<typeof createJsonRestClient<RooamAPI>>

type OpenCheckRequestParams = {
  apiUrl: string,
  partnerId: string,
  username: string,
  password: string,
  idempotencyKey: string,
  body: OpenCheckRequest['body']
}

export const createOpenCheckRequest = ({
  apiUrl,
  username,
  password,
  partnerId,
  idempotencyKey,
  body,
}: OpenCheckRequestParams): OpenCheckRequest => {
  return {
    method: 'POST',
    pathname: `${apiUrl}/v1/partner/${partnerId}/checks`,
    headers: {
      Authorization: `Basic ${btoa([username, password].join(':'))}`,
      'Idempotency-Key': idempotencyKey,
    },
    body,
  }
}

type GetCheckStatusRequestParams = {
  apiUrl: string,
  requestId: string,
  username: string,
  password: string,
}

export const createGetCheckStatusRequest = ({
  apiUrl,
  requestId,
  username,
  password,
}: GetCheckStatusRequestParams): GetCheckStatusRequest => {
  return {
    method: 'GET',
    pathname: `${apiUrl}/v1/partner/open-checks/${requestId}/status`,
    headers: {
      Authorization: `Basic ${btoa([username, password].join(':'))}`,
      'Idempotency-Key': '',
    },
  }
}