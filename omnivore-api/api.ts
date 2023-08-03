import { API_KEY, HOST } from './config'
import {
  AddItemsBody,
  ApplyDiscountToTicketResponse,
  FireTicketRequest,
  FireTicketResponse,
  ItemDiscountsResponse,
  ItemModifiersResponse,
  RetrieveDiscountResponse,
  RetrieveItemResponse,
  SingleTicketResponse,
  TicketDiscount,
  TicketRequestBody,
  TicketResponse,
  VoidItemBody,
  VoidTicketBody,
} from './types'

import { createJsonRestClient } from '@bobcats-coding/skid/rest/json'
import type { RestEndpoint } from '@bobcats-coding/skid/rest/service'

const OMNIVORE_BASE_PATHNAME = 'locations/' as const
// const locationID = 'cMEjrLMi' // for now, this is the only location we have (test)

// TICKETS

export type OmnivoreListTicketsRequest = {
  method: 'GET'
  pathname: `${typeof HOST}${typeof OMNIVORE_BASE_PATHNAME}${string}/tickets/`
  headers: Record<string, string>
}

export type OmnivoreListTicketsResponse = TicketResponse

export type OmnivoreListTicketsEndpoint = RestEndpoint<
  OmnivoreListTicketsRequest,
  OmnivoreListTicketsResponse
>

export type OmnivoreGetSingleTicketRequest = {
  method: 'GET'
  pathname: `${typeof HOST}${typeof OMNIVORE_BASE_PATHNAME}${string}/tickets/${string}`
  headers: Record<string, string>
}

export type OmnivoreGetSingleTicketResponse = SingleTicketResponse

export type OmnivoreGetSingleTicketEndpoint = RestEndpoint<
  OmnivoreGetSingleTicketRequest,
  OmnivoreGetSingleTicketResponse
>

export type OmnivoreOpenTicketRequest = {
  method: 'POST'
  pathname: `${typeof HOST}${typeof OMNIVORE_BASE_PATHNAME}${string}/tickets/`
  headers: Record<string, string>
  body: TicketRequestBody
}

export type OmnivoreOpenTicketResponse = TicketResponse

export type OmnivoreOpenTicketEndpoint = RestEndpoint<
  OmnivoreOpenTicketRequest,
  OmnivoreOpenTicketResponse
>

export type OmnivoreVoidTicketRequest = {
  method: 'POST'
  pathname: `${typeof HOST}${typeof OMNIVORE_BASE_PATHNAME}${string}/tickets/${string}`
  headers: Record<string, string>
  body: VoidTicketBody
}

export type OmnivoreVoidTicketResponse = TicketResponse

export type OmnivoreVoidTicketEndpoint = RestEndpoint<
  OmnivoreVoidTicketRequest,
  OmnivoreVoidTicketResponse
>

export type OmnivoreFireTicketRequest = {
  method: 'POST'
  pathname: `${typeof HOST}${typeof OMNIVORE_BASE_PATHNAME}${string}/tickets/${string}/fire`
  headers: Record<string, string>
  body: FireTicketRequest
}

export type OmnivoreFireTicketResponse = FireTicketResponse

export type OmnivoreFireTicketEndpoint = RestEndpoint<
  OmnivoreFireTicketRequest,
  OmnivoreFireTicketResponse
>

// DISCOUNTS

export type OmnivoreRetrieveDiscountRequest = {
  method: 'GET'
  pathname: `${typeof HOST}${typeof OMNIVORE_BASE_PATHNAME}${string}/tickets/${string}/discounts/${string}`
  headers: Record<string, string>
}

export type OmnivoreRetrieveDiscountResponse = RetrieveDiscountResponse

export type OmnivoreRetrieveDiscountEndpoint = RestEndpoint<
  OmnivoreRetrieveDiscountRequest,
  OmnivoreRetrieveDiscountResponse
>

export type OmnivoreApplyDiscountToTicketRequest = {
  method: 'POST'
  pathname: `${typeof HOST}${typeof OMNIVORE_BASE_PATHNAME}${string}/tickets/${string}/discounts/`
  headers: Record<string, string>
  body: TicketDiscount
}

export type OmnivoreApplyDiscountToTicketResponse = ApplyDiscountToTicketResponse

export type OmnivoreApplyDiscountToTicketEndpoint = RestEndpoint<
  OmnivoreApplyDiscountToTicketRequest,
  OmnivoreApplyDiscountToTicketResponse
>

// ITEMS

export type OmnivoreRetrieveItemRequest = {
  method: 'GET'
  pathname: `${typeof HOST}${typeof OMNIVORE_BASE_PATHNAME}${string}/tickets/${string}/items/${string}`
  headers: Record<string, string>
}

export type OmnivoreRetrieveItemResponse = RetrieveItemResponse

export type OmnivoreRetrieveItemEndpoint = RestEndpoint<
  OmnivoreRetrieveItemRequest,
  OmnivoreRetrieveItemResponse
>

export type OmnivoreAddItemsRequest = {
  method: 'POST'
  pathname: `${typeof HOST}${typeof OMNIVORE_BASE_PATHNAME}${string}/tickets/${string}/items/`
  headers: Record<string, string>
  body: AddItemsBody
}

export type OmnivoreAddItemsResponse = SingleTicketResponse

export type OmnivoreAddItemsEndpoint = RestEndpoint<
  OmnivoreAddItemsRequest,
  OmnivoreAddItemsResponse
>

export type OmnivoreVoidItemRequest = {
  method: 'POST'
  pathname: `${typeof HOST}${typeof OMNIVORE_BASE_PATHNAME}${string}/tickets/${string}/items/${string}`
  headers: Record<string, string>
  body: VoidItemBody
}

export type OmnivoreVoidItemResponse = SingleTicketResponse

export type OmnivoreVoidItemEndpoint = RestEndpoint<
  OmnivoreVoidItemRequest,
  OmnivoreVoidItemResponse
>

// ITEM DISCOUNTS

export type OmnivoreListItemDiscountsRequest = {
  method: 'GET'
  pathname: `${typeof HOST}${typeof OMNIVORE_BASE_PATHNAME}${string}/tickets/${string}/items/${string}/discounts`
  headers: Record<string, string>
}

export type OmnivoreListItemDiscountsResponse = ItemDiscountsResponse

export type OmnivoreListItemDiscountsEndpoint = RestEndpoint<
  OmnivoreListItemDiscountsRequest,
  OmnivoreListItemDiscountsResponse
>

export type OmnivoreRetrieveItemDiscountRequest = {
  method: 'GET'
  pathname: `${typeof HOST}${typeof OMNIVORE_BASE_PATHNAME}${string}/tickets/${string}/items/${string}/discounts`
  headers: Record<string, string>
}

export type OmnivoreRetrieveItemDiscountResponse = ItemDiscountsResponse

export type OmnivoreRetrieveItemDiscountEndpoint = RestEndpoint<
  OmnivoreRetrieveItemDiscountRequest,
  OmnivoreRetrieveItemDiscountResponse
>

// MODIFIERS

export type OmnivoreListItemModifiersRequest = {
  method: 'GET'
  pathname: `${typeof HOST}${typeof OMNIVORE_BASE_PATHNAME}${string}/tickets/${string}/items/${string}/modifiers`
  headers: Record<string, string>
}

export type OmnivoreListItemModifiersResponse = ItemModifiersResponse

export type OmnivoreListItemModifiersEndpoint = RestEndpoint<
  OmnivoreListItemModifiersRequest,
  OmnivoreListItemModifiersResponse
>

export type OmnivoreAPI =
  | OmnivoreListTicketsEndpoint
  | OmnivoreGetSingleTicketEndpoint
  | OmnivoreOpenTicketEndpoint
  | OmnivoreVoidTicketEndpoint
  | OmnivoreRetrieveDiscountEndpoint
  | OmnivoreApplyDiscountToTicketEndpoint
  | OmnivoreRetrieveItemEndpoint
  | OmnivoreAddItemsEndpoint
  | OmnivoreVoidItemEndpoint
  | OmnivoreListItemDiscountsEndpoint
  | OmnivoreRetrieveItemDiscountEndpoint

export const omnivoreAPIClient = createJsonRestClient<OmnivoreAPI>('https', HOST)
export type OmnivoreAPIClient = typeof omnivoreAPIClient

export const createGetTicketsRequest = ({
  locationID,
}: {
  locationID: string
}): OmnivoreListTicketsRequest => {
  return {
    method: 'GET',
    pathname: `${HOST}${OMNIVORE_BASE_PATHNAME}${locationID}/tickets/`,
    headers: { Authorization: API_KEY },
  }
}

export const createGetSingleTicketRequest = ({
  locationID,
  ticketID,
}: {
  locationID: string
  ticketID: string
}): OmnivoreGetSingleTicketRequest => {
  return {
    method: 'GET',
    pathname: `${HOST}${OMNIVORE_BASE_PATHNAME}${locationID}/tickets/${ticketID}}`,
    headers: { Authorization: API_KEY },
  }
}
