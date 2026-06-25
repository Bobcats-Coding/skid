import type {
  GetCheckStatusEndpoint,
  GetCheckStatusResponse,
  GetOrderPricePreviewEndpoint,
  GetOrderPricePreviewResponse,
  GetProductsByGroupEndpoint,
  GetProductsByGroupResponse,
  OpenCheckEndpoint,
  OpenCheckRequest,
  OpenCheckResponse,
  RooamAPI,
  RooamAPIClient,
} from './api'

import type { DeepPartial } from '@bobcats-coding/skid/core/type'
import { createStubRestClient, type StubEndpoint } from '@bobcats-coding/skid/rest/stub'

import { deepmerge, deepmergeCustom } from 'deepmerge-ts'

const FAKE_CHECK = {
  request_id: 'fake-check-id',
  status: 'accepted',
} as const

const FAKE_CHECK_STATUS = {
  message: 'Submitted to POS',
  status: 'SUBMITTED',
  timestamp: 123455678,
} as const

const FAKE_MENU_ITEMS: GetProductsByGroupResponse = {
  menu_items: [
    {
      menu_item_id: 'item-id-123',
      menu_item_group_id: 'item-group-id-123',
      name: 'fake-name',
      price_per_unit: 1200,
      open: false,
      option_sets: [
        {
          option_set_id: 'modifier-group-id-123',
          name: 'fake-modifier-group',
          minimum: 0,
          required: false,
          available_options: [
            {
              option_item_group_id: 'modifier-group-id-123',
              option_id: 'modifier-id-123',
              option_name: 'fake-modifier-name',
              option_price_per_unit: 100,
            },
          ],
        },
      ],
    },
  ],
}

const OPEN_CHECK_BODY: OpenCheckRequest['body'] = {
  check_name: 'check-name',
  items: [
    {
      menu_item_id: 'item-id-123',
      menu_item_group_id: 'item-group-id-123',
      quantity: 1,
      // @TODO we should check payment, but that would broke the bars/service test
    },
  ],
}

const openCheckResponse: OpenCheckResponse = FAKE_CHECK

const openCheckEndpoint: StubEndpoint<OpenCheckEndpoint> = {
  request: {
    method: 'POST',
    pathname: '/v1/partner/partner123/checks',
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
    pathname: `/v1/partner/open-checks/check123/status`,
    headers: {
      // btoa('test-user:test-password')
      Authorization: 'Basic dGVzdC11c2VyOnRlc3QtcGFzc3dvcmQ=',
    },
  },
  response: getCheckStatusResponse,
}

const getProductsByGroupResponse: GetProductsByGroupResponse = FAKE_MENU_ITEMS

const getProductsByGroupEndpoint: StubEndpoint<GetProductsByGroupEndpoint> = {
  request: {
    method: 'GET',
    pathname: `/v1/partner/partner123/menu/items`,
    search: {
      group_id: 'item-group-id-123',
    },
    headers: {
      // btoa('test-user:test-password')
      Authorization: 'Basic dGVzdC11c2VyOnRlc3QtcGFzc3dvcmQ=',
    },
  },
  response: getProductsByGroupResponse,
}

const getOrderPricePreviewResponse: GetOrderPricePreviewResponse = {
  totals: {
    items: 99,
    tax: 11,
    sub_total: 100,
    total: 121,
  },
}

const getOrderPricePreviewEndpoint: StubEndpoint<GetOrderPricePreviewEndpoint> = {
  request: {
    method: 'POST',
    pathname: `/v1/partner/partner123/prices`,
    headers: {
      // btoa('test-user:test-password')
      Authorization: 'Basic dGVzdC11c2VyOnRlc3QtcGFzc3dvcmQ=',
      'Idempotency-Key': 'random-string',
    },
    body: {
      order_type: 'random-uuid',
      items: [
        {
          id: 'item-id-123',
          group_id: 'item-group-id-123',
          quantity: 1,
          options: [],
        },
      ],
    },
  },
  response: getOrderPricePreviewResponse,
}

type StubAPIDefinition = [
  StubEndpoint<OpenCheckEndpoint>,
  StubEndpoint<GetCheckStatusEndpoint>,
  StubEndpoint<GetProductsByGroupEndpoint>,
  StubEndpoint<GetOrderPricePreviewEndpoint>,
]

type CustomStubAPIDefinition = [
  DeepPartial<StubEndpoint<OpenCheckEndpoint>>,
  DeepPartial<StubEndpoint<GetCheckStatusEndpoint>>,
  DeepPartial<StubEndpoint<GetProductsByGroupEndpoint>>,
  DeepPartial<StubEndpoint<GetOrderPricePreviewEndpoint>>,
]

const defaultEndpoints: StubAPIDefinition = [
  openCheckEndpoint,
  getCheckStatusEndpoint,
  getProductsByGroupEndpoint,
  getOrderPricePreviewEndpoint,
]

export const rooamAPIClient: RooamAPIClient = createStubRestClient<RooamAPI, StubAPIDefinition>(
  defaultEndpoints,
)

const withItemsDeepMerge = deepmergeCustom({
  mergeArrays(values, utils, meta) {
    if (meta?.key === 'items') {
      return values[1] ?? values[0]
    }
    return utils.actions.defaultMerge
  },
})

export const createRooamStubAPIClient = (
  customEndpoints: CustomStubAPIDefinition,
): RooamAPIClient => {
  return createStubRestClient<RooamAPI, StubAPIDefinition>([
    withItemsDeepMerge(defaultEndpoints[0], customEndpoints[0]),
    deepmerge(defaultEndpoints[1], customEndpoints[1]),
    deepmerge(defaultEndpoints[2], customEndpoints[2]),
    withItemsDeepMerge(defaultEndpoints[3], customEndpoints[3]),
  ] as StubAPIDefinition)
}
