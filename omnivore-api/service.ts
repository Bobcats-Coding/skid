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

type TicketParams = BaseParams & {
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

type OpenTicketParams = BaseParams & {
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
  params: BaseParams,
): OmnivoreService => {
  const retrieveLocation = (): Observable<LocationResponse> => {
    return omnivoreAPIClient(createRetrieveLocationRequest(params)).pipe(
      map(({ location }) => location),
    )
  }
  const retrieveSingleTicket = (params: TicketParams): Observable<SingleTicketResponse> => {
    return omnivoreAPIClient(createRetrieveSingleTicketRequest(params)).pipe(
      map(({ ticket }) => ticket),
    )
  }
  const getAllTickets = (params: BaseParams): Observable<SingleTicketResponse[]> => {
    return omnivoreAPIClient(createListAllTicketsRequest(params)).pipe(
      map(({ _embedded: { tickets } }) => tickets),
    )
  }

  const openTicket = (params: OpenTicketParams): Observable<SingleTicketResponse> => {
    return omnivoreAPIClient(createOpenTicketRequest(params)).pipe(map((ticketInfo) => ticketInfo))
  }

  const voidTicket = (params: VoidTicketParams): Observable<SingleTicketResponse> => {
    return omnivoreAPIClient(createVoidTicketRequest(params)).pipe(map((ticketInfo) => ticketInfo))
  }

  const listTicketDiscounts = (params: TicketParams): Observable<TicketDiscountsResponse> => {
    return omnivoreAPIClient(createRetrieveSingleTicketRequest(params)).pipe(
      map(({ _embedded: { discounts } }) => discounts),
    )
  }

  const retrieveDiscounts = (params: DiscountParams): Observable<DiscountResponse> => {
    return omnivoreAPIClient(createRetrieveSingleTicketRequest(params)).pipe(
      map(({ _embedded: { discounts } }) => discounts),
    )
  }

  const retrieveSingleDiscount = (params: DiscountParams): Observable<DiscountResponse> => {
    return omnivoreAPIClient(createRetrieveSingleTicketRequest(params)).pipe(
      map(({ _embedded: { discounts } }) => discounts),
    )
  }

  const retrieveItemDiscount = (params: DiscountParams): Observable<DiscountResponse> => {
    return omnivoreAPIClient(createRetrieveSingleTicketRequest(params)).pipe(
      map(({ _embedded: { discounts } }) => discounts),
    )
  }

  const applyDiscount = (params: ApplyDiscountParams): Observable<SingleTicketResponse> => {
    return omnivoreAPIClient(createRetrieveSingleTicketRequest(params)).pipe(
      map(({ _embedded }) => _embedded),
    )
  }

  const fireTicket = (params: FireTicketParams): Observable<SingleTicketResponse> => {
    return omnivoreAPIClient(createRetrieveSingleTicketRequest(params)).pipe(
      map(({ _embedded }) => _embedded),
    )
  }

  const listTicketItems = (params: TicketParams): Observable<SingleTicketResponse> => {
    return omnivoreAPIClient(createRetrieveSingleTicketRequest(params)).pipe(
      map(({ _embedded }) => _embedded),
    )
  }

  const retrieveTicketItem = (params: ItemParams): Observable<TicketItem> => {
    return omnivoreAPIClient(createRetrieveSingleTicketRequest(params)).pipe(
      map(({ _embedded }) => _embedded),
    )
  }

  const addItemsToTicket = (params: AddItemsToTicketParams): Observable<SingleTicketResponse> => {
    return omnivoreAPIClient(createRetrieveSingleTicketRequest(params)).pipe(
      map(({ _embedded }) => _embedded),
    )
  }

  const listItemDiscounts = (params: ItemParams): Observable<TicketDiscountsResponse> => {
    return omnivoreAPIClient(createRetrieveSingleTicketRequest(params)).pipe(
      map(({ _embedded }) => _embedded),
    )
  }

  const listItemModifiers = (params: ItemParams): Observable<ItemModifiersResponse> => {
    return omnivoreAPIClient(createRetrieveSingleTicketRequest(params)).pipe(
      map(({ _embedded }) => _embedded),
    )
  }

  const retrieveItemModifier = (params: ModifierParams): Observable<Modifier> => {
    return omnivoreAPIClient(createRetrieveSingleTicketRequest(params)).pipe(
      map(({ _embedded }) => _embedded),
    )
  }

  const listTicketPayments = (params: TicketParams): Observable<TicketPaymentsResponse> => {
    return omnivoreAPIClient(createRetrieveSingleTicketRequest(params)).pipe(
      map(({ _embedded }) => _embedded),
    )
  }

  const retrieveTicketPayment = (params: PaymentParams): Observable<TicketPaymentsResponse> => {
    return omnivoreAPIClient(createRetrieveSingleTicketRequest(params)).pipe(
      map(({ _embedded }) => _embedded),
    )
  }

  const makeThirdPartyPayment = (params: MakePaymentParams): Observable<TicketPayment> => {
    return omnivoreAPIClient(createRetrieveSingleTicketRequest(params)).pipe(
      map(({ _embedded }) => _embedded),
    )
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
