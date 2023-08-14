import {
  createListAllTicketsRequest,
  createOpenTicketRequest,
  createRetrieveLocationRequest,
  createRetrieveSingleTicketRequest,
  createVoidTicketRequest,
} from './api'
import type { OmnivoreAPIClient } from './api'
import {
  ApplyDiscountBody,
  DiscountResponse,
  FireTicketBody,
  ItemModifiersResponse,
  ItemsToAdd,
  LocationResponse,
  Modifier,
  OpenTicketRequest,
  SingleTicketResponse,
  ThirdPartyPaymentBody,
  TicketDiscountsResponse,
  TicketItem,
  TicketPayment,
  TicketPaymentsResponse,
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
  getAllTickets: (params: BaseParams) => Observable<SingleTicketResponse[]>
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
  retrieveTicketPayment: (params: PaymentParams) => Observable<TicketPaymentsResponse>
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
    ).pipe(map(({ ticket }) => ticket))
  }
  const getAllTickets = (): Observable<SingleTicketResponse[]> => {
    return omnivoreAPIClient(createListAllTicketsRequest(baseParams)).pipe(
      map(({ _embedded: { tickets } }) => tickets),
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
    ).pipe(map(({ _embedded: { discounts } }) => discounts))
  }

  const retrieveDiscounts = (discountParams: DiscountParams): Observable<DiscountResponse> => {
    return omnivoreAPIClient(
      createRetrieveSingleTicketRequest({ ...baseParams, ...discountParams }),
    ).pipe(map(({ _embedded: { discounts } }) => discounts))
  }

  const retrieveSingleDiscount = (discountParams: DiscountParams): Observable<DiscountResponse> => {
    return omnivoreAPIClient(
      createRetrieveSingleTicketRequest({ ...baseParams, ...discountParams }),
    ).pipe(map(({ _embedded: { discounts } }) => discounts))
  }

  const retrieveItemDiscount = (discountParams: DiscountParams): Observable<DiscountResponse> => {
    return omnivoreAPIClient(
      createRetrieveSingleTicketRequest({ ...baseParams, ...discountParams }),
    ).pipe(map(({ _embedded: { discounts } }) => discounts))
  }

  const applyDiscount = (
    fireTicketParams: ApplyDiscountParams,
  ): Observable<SingleTicketResponse> => {
    return omnivoreAPIClient(
      createRetrieveSingleTicketRequest({ ...baseParams, ...fireTicketParams }),
    ).pipe(map(({ _embedded }) => _embedded))
  }

  const fireTicket = (fireTicketParams: FireTicketParams): Observable<SingleTicketResponse> => {
    return omnivoreAPIClient(
      createRetrieveSingleTicketRequest({ ...baseParams, ...fireTicketParams }),
    ).pipe(map(({ _embedded }) => _embedded))
  }

  const listTicketItems = (ticketParams: TicketParams): Observable<SingleTicketResponse> => {
    return omnivoreAPIClient(
      createRetrieveSingleTicketRequest({ ...baseParams, ...ticketParams }),
    ).pipe(map(({ _embedded }) => _embedded))
  }

  const retrieveTicketItem = (itemParams: ItemParams): Observable<TicketItem> => {
    return omnivoreAPIClient(
      createRetrieveSingleTicketRequest({ ...baseParams, ...itemParams }),
    ).pipe(map(({ _embedded }) => _embedded))
  }

  const addItemsToTicket = (
    addItemsParams: AddItemsToTicketParams,
  ): Observable<SingleTicketResponse> => {
    return omnivoreAPIClient(
      createRetrieveSingleTicketRequest({ ...baseParams, ...addItemsParams }),
    ).pipe(map(({ _embedded }) => _embedded))
  }

  const listItemDiscounts = (itemParams: ItemParams): Observable<TicketDiscountsResponse> => {
    return omnivoreAPIClient(
      createRetrieveSingleTicketRequest({ ...baseParams, ...itemParams }),
    ).pipe(map(({ _embedded }) => _embedded))
  }

  const listItemModifiers = (itemParams: ItemParams): Observable<ItemModifiersResponse> => {
    return omnivoreAPIClient(
      createRetrieveSingleTicketRequest({ ...baseParams, ...itemParams }),
    ).pipe(map(({ _embedded }) => _embedded))
  }

  const retrieveItemModifier = (modifierParams: ModifierParams): Observable<Modifier> => {
    return omnivoreAPIClient(
      createRetrieveSingleTicketRequest({ ...baseParams, ...modifierParams }),
    ).pipe(map(({ _embedded }) => _embedded))
  }

  const listTicketPayments = (ticketParams: TicketParams): Observable<TicketPaymentsResponse> => {
    return omnivoreAPIClient(
      createRetrieveSingleTicketRequest({ ...baseParams, ...ticketParams }),
    ).pipe(map(({ _embedded }) => _embedded))
  }

  const retrieveTicketPayment = (
    paymentParams: PaymentParams,
  ): Observable<TicketPaymentsResponse> => {
    return omnivoreAPIClient(
      createRetrieveSingleTicketRequest({ ...baseParams, ...paymentParams }),
    ).pipe(map(({ _embedded }) => _embedded))
  }

  const makeThirdPartyPayment = (
    makePaymentParams: MakePaymentParams,
  ): Observable<TicketPayment> => {
    return omnivoreAPIClient(
      createRetrieveSingleTicketRequest({ ...baseParams, ...makePaymentParams }),
    ).pipe(map(({ _embedded }) => _embedded))
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
