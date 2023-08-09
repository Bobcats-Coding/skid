import {
  ApplyDiscountBody,
  DiscountResponse,
  FireTicketBody,
  GetAllTicketsResponse,
  ItemModifiersResponse,
  ItemsToAdd,
  LocationResponse,
  Modifier,
  OpenTicketRequest,
  SingleTicketResponse,
  ThirdPartyPaymentBody,
  TicketDiscountsResponse,
  TicketItem,
  TicketItemsResponse,
  TicketPayment,
  TicketPaymentsResponse,
} from './types'

import { createJsonRestClient } from '@bobcats-coding/skid/rest/json'
import type { RestEndpoint } from '@bobcats-coding/skid/rest/service'

// base path with the location is the same for all requests since everything is location-specific in the API
const basePath = 'https://api.omnivore.io/1.0/locations/'

// LOCATION
type RetrieveLocationRequest = {
  method: 'GET'
  pathname: `${typeof basePath}${string}`
  headers: Record<string, string>
}

type RetrieveLocationResponse = LocationResponse

export type RetrieveLocationEndpoint = RestEndpoint<
  RetrieveLocationRequest,
  RetrieveLocationResponse
>

// TICKETS

type RetrieveSingleTicketRequest = {
  method: 'GET'
  pathname: `${typeof basePath}${string}/tickets/${string}`
  headers: Record<string, string>
}

type RetrieveSingleTicketResponse = SingleTicketResponse

export type RetrieveSingleTicketEndpoint = RestEndpoint<
  RetrieveSingleTicketRequest,
  RetrieveSingleTicketResponse
>

type ListAllTicketsRequest = {
  method: 'GET'
  pathname: `${typeof basePath}${string}/tickets`
  headers: Record<string, string>
}

type ListAllTicketsResponse = GetAllTicketsResponse

export type ListAllTicketsEndpoint = RestEndpoint<ListAllTicketsRequest, ListAllTicketsResponse>

type CreateTicketRequest = {
  method: 'POST'
  pathname: `${typeof basePath}${string}/tickets`
  headers: Record<string, string>
  body: OpenTicketRequest
}

type CreateTicketResponse = SingleTicketResponse

export type CreateTicketEndpoint = RestEndpoint<CreateTicketRequest, CreateTicketResponse>

type VoidTicketRequest = {
  method: 'POST'
  pathname: `${typeof basePath}${string}/tickets/${string}/void`
  headers: Record<string, string>
  body: { void: true }
}

type VoidTicketResponse = SingleTicketResponse

export type VoidTicketEndpoint = RestEndpoint<VoidTicketRequest, VoidTicketResponse>

// DISCOUNTS

type ListTicketDiscountsRequest = {
  method: 'GET'
  pathname: `${typeof basePath}${string}/tickets/${string}/discounts`
  headers: Record<string, string>
}

type ListTicketDiscountsResponse = TicketDiscountsResponse

export type ListTicketDiscountsEndpoint = RestEndpoint<
  ListTicketDiscountsRequest,
  ListTicketDiscountsResponse
>

type RetrieveDiscountRequest = {
  method: 'GET'
  pathname: `${typeof basePath}${string}/discounts/${string}`
  headers: Record<string, string>
}

type RetrieveDiscountResponse = DiscountResponse

export type RetrieveDiscountEndpoint = RestEndpoint<
  RetrieveDiscountRequest,
  RetrieveDiscountResponse
>

type ApplyDiscountRequest = {
  method: 'POST'
  pathname: `${typeof basePath}${string}/tickets/${string}/discounts`
  headers: Record<string, string>
  body: ApplyDiscountBody[]
}

type ApplyDiscountResponse = SingleTicketResponse

export type ApplyDiscountEndpoint = RestEndpoint<ApplyDiscountRequest, ApplyDiscountResponse>

// commenting this one out for now since exact endpoint and body are not known yet:(

// type VoidDiscountRequest = {
//   method: 'DELETE'
//   pathname: `${typeof basePath}${string}/tickets/${string}/discounts/${string}/void`
//   headers: Record<string, string>
//   body: { void: true }
// }

// FIRE

type FireTicketRequest = {
  method: 'POST'
  pathname: `${typeof basePath}${string}/tickets/${string}/fire`
  headers: Record<string, string>
  body: FireTicketBody
}

type FireTicketResponse = SingleTicketResponse

export type FireTicketEndpoint = RestEndpoint<FireTicketRequest, FireTicketResponse>

// ITEMS

type ListTicketItemsRequest = {
  method: 'GET'
  pathname: `${typeof basePath}${string}/tickets/${string}/items`
  headers: Record<string, string>
}

type ListTicketItemsResponse = TicketItemsResponse

export type ListTicketItemsEndpoint = RestEndpoint<ListTicketItemsRequest, ListTicketItemsResponse>

type RetrieveTicketItemRequest = {
  method: 'GET'
  pathname: `${typeof basePath}${string}/tickets/${string}/items/${string}`
  headers: Record<string, string>
}

type RetrieveTicketItemResponse = TicketItem

export type RetrieveTicketItemEndpoint = RestEndpoint<
  RetrieveTicketItemRequest,
  RetrieveTicketItemResponse
>

type AddItemsToTicketRequest = {
  method: 'POST'
  pathname: `${typeof basePath}${string}/tickets/${string}/items`
  headers: Record<string, string>
  body: ItemsToAdd
}

type AddItemsToTicketResponse = SingleTicketResponse

export type AddItemsToTicketEndpoint = RestEndpoint<
  AddItemsToTicketRequest,
  AddItemsToTicketResponse
>

type ListItemDiscountsRequest = {
  method: 'GET'
  pathname: `${typeof basePath}${string}/tickets/${string}/items/${string}/discounts`
  headers: Record<string, string>
}

type ListItemDiscountsResponse = TicketDiscountsResponse

export type ListItemDiscountsEndpoint = RestEndpoint<
  ListItemDiscountsRequest,
  ListItemDiscountsResponse
>

// documentation is missing, do not trust this 100% yet ⬇️

type RetrieveItemDiscountRequest = {
  method: 'GET'
  pathname: `${typeof basePath}${string}/tickets/${string}/items/${string}/discounts/${string}`
  headers: Record<string, string>
}

type RetrieveItemDiscountResponse = DiscountResponse

export type RetrieveItemDiscountEndpoint = RestEndpoint<
  RetrieveItemDiscountRequest,
  RetrieveItemDiscountResponse
>

// the endpoint/body are still missing for VOID ITEM, will implement that later

// MODIFIERS

type ListItemModifiersRequest = {
  method: 'GET'
  pathname: `${typeof basePath}${string}/tickets/${string}/items/${string}/modifiers`
  headers: Record<string, string>
}

type ListItemModifiersResponse = ItemModifiersResponse

export type ListItemModifiersEndpoint = RestEndpoint<
  ListItemModifiersRequest,
  ListItemModifiersResponse
>

type RetrieveItemModifierRequest = {
  method: 'GET'
  pathname: `${typeof basePath}${string}/tickets/${string}/items/${string}/modifiers/${string}`
  headers: Record<string, string>
}

type RetrieveItemModifierResponse = Modifier

export type RetrieveItemModifierEndpoint = RestEndpoint<
  RetrieveItemModifierRequest,
  RetrieveItemModifierResponse
>

// PAYMENTS

type ListPaymentsRequest = {
  method: 'GET'
  pathname: `${typeof basePath}${string}/tickets/${string}/payments`
  headers: Record<string, string>
}

type ListPaymentsResponse = TicketPaymentsResponse

export type ListPaymentsEndpoint = RestEndpoint<ListPaymentsRequest, ListPaymentsResponse>

type RetrievePaymentRequest = {
  method: 'GET'
  pathname: `${typeof basePath}${string}/tickets/${string}/payments/${string}`
  headers: Record<string, string>
}

type RetrievePaymentResponse = TicketPayment

export type RetrievePaymentEndpoint = RestEndpoint<RetrievePaymentRequest, RetrievePaymentResponse>

type ThirdPartyPaymentRequest = {
  method: 'POST'
  pathname: `${typeof basePath}${string}/tickets/${string}/payments`
  headers: Record<string, string>
  body: ThirdPartyPaymentBody
}

type ThirdPartyPaymentResponse = TicketPayment

export type ThirdPartyPaymentEndpoint = RestEndpoint<
  ThirdPartyPaymentRequest,
  ThirdPartyPaymentResponse
>

export type OmnivoreAPI =
  | RetrieveLocationEndpoint
  | RetrieveSingleTicketEndpoint
  | ListAllTicketsEndpoint
  | CreateTicketEndpoint
  | VoidTicketEndpoint
  | ListTicketDiscountsEndpoint
  | RetrieveDiscountEndpoint
  | ApplyDiscountEndpoint
  | FireTicketEndpoint
  | ListTicketItemsEndpoint
  | RetrieveTicketItemEndpoint
  | AddItemsToTicketEndpoint
  | ListItemDiscountsEndpoint
  | RetrieveItemDiscountEndpoint
  | ListItemModifiersEndpoint
  | RetrieveItemModifierEndpoint
  | ListPaymentsEndpoint
  | RetrievePaymentEndpoint
  | ThirdPartyPaymentEndpoint

export const omnivoreAPIClient = createJsonRestClient<OmnivoreAPI>('https', basePath)
export type OmnivoreAPIClient = typeof omnivoreAPIClient

export const createRetrieveLocationRequest = ({
  locationID,
  apiKey,
}: {
  locationID: string
  apiKey: string
}): RetrieveLocationRequest => {
  return {
    method: 'GET',
    pathname: `${basePath}${locationID}`,
    headers: { 'Api-Key': apiKey },
  }
}

export const createRetrieveSingleTicketRequest = ({
  locationID,
  ticketID,
  apiKey,
}: {
  locationID: string
  ticketID: string
  apiKey: string
}): RetrieveSingleTicketRequest => {
  return {
    method: 'GET',
    pathname: `${basePath}${locationID}/tickets/${ticketID}`,
    headers: { 'Api-Key': apiKey },
  }
}

export const createListAllTicketsRequest = ({
  locationID,
  apiKey,
}: {
  locationID: string
  apiKey: string
}): ListAllTicketsRequest => {
  return {
    method: 'GET',
    pathname: `${basePath}${locationID}/tickets`,
    headers: { 'Api-Key': apiKey },
  }
}

export const createOpenTicketRequest = ({
  locationID,
  apiKey,
  body,
}: {
  locationID: string
  apiKey: string
  body: OpenTicketRequest
}): CreateTicketRequest => {
  return {
    method: 'POST',
    pathname: `${basePath}${locationID}/tickets`,
    headers: { 'Api-Key': apiKey },
    body,
  }
}

export const createVoidTicketRequest = ({
  locationID,
  ticketID,
  apiKey,
}: {
  locationID: string
  ticketID: string
  apiKey: string
}): VoidTicketRequest => {
  return {
    method: 'POST',
    pathname: `${basePath}${locationID}/tickets/${ticketID}/void`,
    headers: { 'Api-Key': apiKey },
    body: { void: true },
  }
}

export const createListTicketDiscountsRequest = ({
  locationID,
  ticketID,
  apiKey,
}: {
  locationID: string
  ticketID: string
  apiKey: string
}): ListTicketDiscountsRequest => {
  return {
    method: 'GET',
    pathname: `${basePath}${locationID}/tickets/${ticketID}/discounts`,
    headers: { 'Api-Key': apiKey },
  }
}

export const createRetrieveDiscountRequest = ({
  locationID,
  discountID,
  apiKey,
}: {
  locationID: string
  discountID: string
  apiKey: string
}): RetrieveDiscountRequest => {
  return {
    method: 'GET',
    pathname: `${basePath}${locationID}/discounts/${discountID}`,
    headers: { 'Api-Key': apiKey },
  }
}

export const createApplyDiscountRequest = ({
  locationID,
  ticketID,
  apiKey,
  body,
}: {
  locationID: string
  ticketID: string
  apiKey: string
  body: ApplyDiscountBody[]
}): ApplyDiscountRequest => {
  return {
    method: 'POST',
    pathname: `${basePath}${locationID}/tickets/${ticketID}/discounts`,
    headers: { 'Api-Key': apiKey },
    body,
  }
}

export const createFireTicketRequest = ({
  locationID,
  ticketID,
  apiKey,
  body,
}: {
  locationID: string
  ticketID: string
  apiKey: string
  body: FireTicketBody
}): FireTicketRequest => {
  return {
    method: 'POST',
    pathname: `${basePath}${locationID}/tickets/${ticketID}/fire`,
    headers: { 'Api-Key': apiKey },
    body,
  }
}

export const createListTicketItemsRequest = ({
  locationID,
  ticketID,
  apiKey,
}: {
  locationID: string
  ticketID: string
  apiKey: string
}): ListTicketItemsRequest => {
  return {
    method: 'GET',
    pathname: `${basePath}${locationID}/tickets/${ticketID}/items`,
    headers: { 'Api-Key': apiKey },
  }
}

export const createRetrieveTicketItemRequest = ({
  locationID,
  ticketID,
  itemID,
  apiKey,
}: {
  locationID: string
  ticketID: string
  itemID: string
  apiKey: string
}): RetrieveTicketItemRequest => {
  return {
    method: 'GET',
    pathname: `${basePath}${locationID}/tickets/${ticketID}/items/${itemID}`,
    headers: { 'Api-Key': apiKey },
  }
}

export const createAddItemsToTicketRequest = ({
  locationID,
  ticketID,
  apiKey,
  body,
}: {
  locationID: string
  ticketID: string
  apiKey: string
  body: ItemsToAdd
}): AddItemsToTicketRequest => {
  return {
    method: 'POST',
    pathname: `${basePath}${locationID}/tickets/${ticketID}/items`,
    headers: { 'Api-Key': apiKey },
    body,
  }
}

export const createListItemDiscountsRequest = ({
  locationID,
  ticketID,
  itemID,
  apiKey,
}: {
  locationID: string
  ticketID: string
  itemID: string
  apiKey: string
}): ListItemDiscountsRequest => {
  return {
    method: 'GET',
    pathname: `${basePath}${locationID}/tickets/${ticketID}/items/${itemID}/discounts`,
    headers: { 'Api-Key': apiKey },
  }
}

export const createRetrieveItemDiscountRequest = ({
  locationID,
  ticketID,
  itemID,
  discountID,
  apiKey,
}: {
  locationID: string
  ticketID: string
  itemID: string
  discountID: string
  apiKey: string
}): RetrieveItemDiscountRequest => {
  return {
    method: 'GET',
    pathname: `${basePath}${locationID}/tickets/${ticketID}/items/${itemID}/discounts/${discountID}`,
    headers: { 'Api-Key': apiKey },
  }
}

export const createListItemModifiersRequest = ({
  locationID,
  ticketID,
  itemID,
  apiKey,
}: {
  locationID: string
  ticketID: string
  itemID: string
  apiKey: string
}): ListItemModifiersRequest => {
  return {
    method: 'GET',
    pathname: `${basePath}${locationID}/tickets/${ticketID}/items/${itemID}/modifiers`,
    headers: { 'Api-Key': apiKey },
  }
}

export const createRetrieveItemModifierRequest = ({
  locationID,
  ticketID,
  itemID,
  modifierID,
  apiKey,
}: {
  locationID: string
  ticketID: string
  itemID: string
  modifierID: string
  apiKey: string
}): RetrieveItemModifierRequest => {
  return {
    method: 'GET',
    pathname: `${basePath}${locationID}/tickets/${ticketID}/items/${itemID}/modifiers/${modifierID}`,
    headers: { 'Api-Key': apiKey },
  }
}

export const createListTicketPaymentsRequest = ({
  locationID,
  ticketID,
  apiKey,
}: {
  locationID: string
  ticketID: string
  apiKey: string
}): ListPaymentsRequest => {
  return {
    method: 'GET',
    pathname: `${basePath}${locationID}/tickets/${ticketID}/payments`,
    headers: { 'Api-Key': apiKey },
  }
}

export const createRetrieveTicketPaymentRequest = ({
  locationID,
  ticketID,
  paymentID,
  apiKey,
}: {
  locationID: string
  ticketID: string
  paymentID: string
  apiKey: string
}): RetrievePaymentRequest => {
  return {
    method: 'GET',
    pathname: `${basePath}${locationID}/tickets/${ticketID}/payments/${paymentID}`,
    headers: { 'Api-Key': apiKey },
  }
}

export const createThirdPartyPaymentRequest = ({
  locationID,
  ticketID,
  apiKey,
  body,
}: {
  locationID: string
  ticketID: string
  apiKey: string
  body: ThirdPartyPaymentBody
}): ThirdPartyPaymentRequest => {
  return {
    method: 'POST',
    pathname: `${basePath}${locationID}/tickets/${ticketID}/payments`,
    headers: { 'Api-Key': apiKey },
    body,
  }
}
