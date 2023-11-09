import type {
  GetCheckStatusEndpoint,
  GetCheckStatusResponse,
  OpenCheckEndpoint,
  OpenCheckRequest,
  OpenCheckResponse,
  RooamAPI,
  RooamAPIClient,
} from './api'

import { createStubRestClient, type StubEndpoint } from '@bobcats-coding/skid/rest/stub'

const FAKE_CHECK = {
  request_id: 'fake-check-id',
  status: 'accepted',
} as const

const FAKE_CHECK_STATUS = {
  message: 'Submitted to POS',
  status: 'SUBMITTED',
  timestamp: 123455678,
} as const

const OPEN_CHECK_BODY: OpenCheckRequest['body'] = {
  items: [
    {
      menu_item_id: 'item-id-123',
      menu_item_group_id: 'item-group-id-123',
      quantity: 1,
    },
  ],
}

const openCheckResponse: OpenCheckResponse = FAKE_CHECK

const openCheckEndpoint: StubEndpoint<OpenCheckEndpoint> = {
  request: {
    method: 'POST',
    pathname: 'https://test.rooam.co/v1/partner/partner123/checks',
    headers: {
      // btoa('test-user:test-password')
      Authorization: 'Basic dGVzdC11c2VyOnRlc3QtcGFzc3dvcmQ=',
      'Idempotency-Key': 'random-string',
    },
    body: OPEN_CHECK_BODY,
  },
  response: openCheckResponse,
}

const getCheckStatusResponse: GetCheckStatusResponse = FAKE_CHECK_STATUS

const getCheckStatusEndpoint: StubEndpoint<GetCheckStatusEndpoint> = {
  request: {
    method: 'GET',
    pathname: `https://test.rooam.co/v1/partner/open-checks/check123/status`,
    headers: {
      // btoa('test-user:test-password')
      Authorization: 'Basic dGVzdC11c2VyOnRlc3QtcGFzc3dvcmQ=',
    },
  },
  response: getCheckStatusResponse,
}

const endpoints = [openCheckEndpoint, getCheckStatusEndpoint] as const

export const rooamAPIClient: RooamAPIClient = createStubRestClient<RooamAPI, typeof endpoints>(
  endpoints,
)
