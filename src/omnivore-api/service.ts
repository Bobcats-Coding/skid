import {
  createListAllTicketsRequest,
  createOpenTicketRequest,
  createRetrieveLocationRequest,
  createRetrieveSingleTicketRequest,
  createVoidTicketRequest,
} from './api'
import type { OmnivoreAPIClient } from './api'
import {
  type ApplyDiscountBody,
  type DiscountResponse,
  type FireTicketBody,
  type GetAllTicketsResponse,
  type ItemModifiersResponse,
  type ItemsToAdd,
  type LocationResponse,
  type Modifier,
  type OpenTicketRequest,
  type SingleTicketResponse,
  type ThirdPartyPaymentBody,
  type TicketDiscountsResponse,
  type TicketItem,
  type TicketPayment,
  type TicketPaymentsResponse,
} from './types'

import type { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

type BaseParams = {
  apiKey: string
  locationID: string
}

type TicketParams = {
  ticketID: string
}

type PaymentParams = TicketParams & {
  paymentID: string
}

type MakePaymentParams = TicketParams & {
  body: ThirdPartyPaymentBody
}

type DiscountParams = TicketParams & {
  discountID: string
}

type OpenTicketParams = {
  body: OpenTicketRequest
}

type VoidTicketParams = TicketParams & {
  void: boolean
}

type ApplyDiscountParams = TicketParams & { body: ApplyDiscountBody[] }

type FireTicketParams = TicketParams & { body: FireTicketBody }

type ItemParams = TicketParams & {
  itemID: string
}

type ModifierParams = ItemParams & {
  modifierID: string
}

type AddItemsToTicketParams = TicketParams & ItemsToAdd

export type OmnivoreService = {
  retrieveLocation: () => Observable<LocationResponse | undefined>
  retrieveSingleTicket: (params: TicketParams) => Observable<SingleTicketResponse | undefined>
  getAllTickets: () => Observable<GetAllTicketsResponse>
  openTicket: (params: OpenTicketParams) => Observable<SingleTicketResponse | undefined>
  voidTicket: (params: VoidTicketParams) => Observable<SingleTicketResponse>
  listTicketDiscounts: (params: TicketParams) => Observable<TicketDiscountsResponse>
  retrieveDiscounts: (params: DiscountParams) => Observable<DiscountResponse>
  retrieveSingleDiscount: (params: DiscountParams) => Observable<DiscountResponse>
  applyDiscount: (params: ApplyDiscountParams) => Observable<SingleTicketResponse>
  fireTicket: (params: FireTicketParams) => Observable<SingleTicketResponse>
  listTicketItems: (params: TicketParams) => Observable<SingleTicketResponse>
  retrieveTicketItem: (params: ItemParams) => Observable<TicketItem>
  addItemsToTicket: (params: AddItemsToTicketParams) => Observable<SingleTicketResponse>
  listItemDiscounts: (params: ItemParams) => Observable<TicketDiscountsResponse>
  retrieveItemDiscount: (params: DiscountParams) => Observable<DiscountResponse>
  listItemModifiers: (params: ItemParams) => Observable<ItemModifiersResponse>
  retrieveItemModifier: (params: ModifierParams) => Observable<Modifier>
  listTicketPayments: (params: TicketParams) => Observable<TicketPaymentsResponse>
  retrieveTicketPayment: (params: PaymentParams) => Observable<TicketPayment>
  makeThirdPartyPayment: (params: MakePaymentParams) => Observable<TicketPayment>
}

export const createOmnivoreService = (
  omnivoreAPIClient: OmnivoreAPIClient,
  baseParams: BaseParams,
): OmnivoreService => {
  const retrieveLocation = (): Observable<LocationResponse> => {
    return omnivoreAPIClient(createRetrieveLocationRequest(baseParams)).pipe(
      map((_embedded) => _embedded),
    )
  }
  const retrieveSingleTicket = (ticketParams: TicketParams): Observable<SingleTicketResponse> => {
    return omnivoreAPIClient(
      createRetrieveSingleTicketRequest({ ...baseParams, ...ticketParams }),
    ).pipe(map((ticketResponse) => ticketResponse))
  }

  const getAllTickets = (): Observable<GetAllTicketsResponse> => {
    return omnivoreAPIClient(createListAllTicketsRequest(baseParams)).pipe(
      map((ticketsResponse) => ticketsResponse),
    )
  }

  const openTicket = (openTicketParams: OpenTicketParams): Observable<SingleTicketResponse> => {
    return omnivoreAPIClient(createOpenTicketRequest({ ...baseParams, ...openTicketParams })).pipe(
      map((ticketInfo) => ticketInfo),
    )
  }

  const voidTicket = (voidTicketParams: VoidTicketParams): Observable<SingleTicketResponse> => {
    return omnivoreAPIClient(createVoidTicketRequest({ ...baseParams, ...voidTicketParams })).pipe(
      map((ticketInfo) => ticketInfo),
    )
  }

  const listTicketDiscounts = (ticketParams: TicketParams): Observable<TicketDiscountsResponse> => {
    return omnivoreAPIClient(
      createRetrieveSingleTicketRequest({ ...baseParams, ...ticketParams }),
    ).pipe(map((ticketDiscounts) => ticketDiscounts))
  }

  const retrieveDiscounts = (discountParams: DiscountParams): Observable<DiscountResponse> => {
    return omnivoreAPIClient(
      createRetrieveSingleTicketRequest({ ...baseParams, ...discountParams }),
    ).pipe(map((ticketDiscounts) => ticketDiscounts))
  }

  const retrieveSingleDiscount = (discountParams: DiscountParams): Observable<DiscountResponse> => {
    return omnivoreAPIClient(
      createRetrieveSingleTicketRequest({ ...baseParams, ...discountParams }),
    ).pipe(map((ticketDiscount) => ticketDiscount))
  }

  const retrieveItemDiscount = (discountParams: DiscountParams): Observable<DiscountResponse> => {
    return omnivoreAPIClient(
      createRetrieveSingleTicketRequest({ ...baseParams, ...discountParams }),
    ).pipe(map((itemDiscount) => itemDiscount))
  }

  const applyDiscount = (
    fireTicketParams: ApplyDiscountParams,
  ): Observable<SingleTicketResponse> => {
    return omnivoreAPIClient(
      createRetrieveSingleTicketRequest({ ...baseParams, ...fireTicketParams }),
    ).pipe(map((ticket) => ticket))
  }

  const fireTicket = (fireTicketParams: FireTicketParams): Observable<SingleTicketResponse> => {
    return omnivoreAPIClient(
      createRetrieveSingleTicketRequest({ ...baseParams, ...fireTicketParams }),
    ).pipe(map((firedTicket) => firedTicket))
  }

  const listTicketItems = (ticketParams: TicketParams): Observable<SingleTicketResponse> => {
    return omnivoreAPIClient(
      createRetrieveSingleTicketRequest({ ...baseParams, ...ticketParams }),
    ).pipe(map((ticketItems) => ticketItems))
  }

  const retrieveTicketItem = (itemParams: ItemParams): Observable<TicketItem> => {
    return omnivoreAPIClient(
      createRetrieveSingleTicketRequest({ ...baseParams, ...itemParams }),
    ).pipe(map((ticketItem) => ticketItem))
  }

  const addItemsToTicket = (
    addItemsParams: AddItemsToTicketParams,
  ): Observable<SingleTicketResponse> => {
    return omnivoreAPIClient(
      createRetrieveSingleTicketRequest({ ...baseParams, ...addItemsParams }),
    ).pipe(map((ticket) => ticket))
  }

  const listItemDiscounts = (itemParams: ItemParams): Observable<TicketDiscountsResponse> => {
    return omnivoreAPIClient(
      createRetrieveSingleTicketRequest({ ...baseParams, ...itemParams }),
    ).pipe(map((ticketDiscounts) => ticketDiscounts))
  }

  const listItemModifiers = (itemParams: ItemParams): Observable<ItemModifiersResponse> => {
    return omnivoreAPIClient(
      createRetrieveSingleTicketRequest({ ...baseParams, ...itemParams }),
    ).pipe(map((itemModifiers) => itemModifiers))
  }

  const retrieveItemModifier = (modifierParams: ModifierParams): Observable<Modifier> => {
    return omnivoreAPIClient(
      createRetrieveSingleTicketRequest({ ...baseParams, ...modifierParams }),
    ).pipe(map((itemModifier) => itemModifier))
  }

  const listTicketPayments = (ticketParams: TicketParams): Observable<TicketPaymentsResponse> => {
    return omnivoreAPIClient(
      createRetrieveSingleTicketRequest({ ...baseParams, ...ticketParams }),
    ).pipe(map((ticketPayments) => ticketPayments))
  }

  const retrieveTicketPayment = (paymentParams: PaymentParams): Observable<TicketPayment> => {
    return omnivoreAPIClient(
      createRetrieveSingleTicketRequest({ ...baseParams, ...paymentParams }),
    ).pipe(map((ticketPayment) => ticketPayment))
  }

  const makeThirdPartyPayment = (
    makePaymentParams: MakePaymentParams,
  ): Observable<TicketPayment> => {
    return omnivoreAPIClient(
      createRetrieveSingleTicketRequest({ ...baseParams, ...makePaymentParams }),
    ).pipe(map((payment) => payment))
  }

  return {
    retrieveLocation,
    retrieveSingleTicket,
    getAllTickets,
    openTicket,
    voidTicket,
    listTicketDiscounts,
    retrieveDiscounts,
    applyDiscount,
    retrieveSingleDiscount,
    fireTicket,
    listTicketItems,
    retrieveTicketItem,
    addItemsToTicket,
    listItemDiscounts,
    retrieveItemDiscount,
    listItemModifiers,
    retrieveItemModifier,
    listTicketPayments,
    retrieveTicketPayment,
    makeThirdPartyPayment,
  }
}
