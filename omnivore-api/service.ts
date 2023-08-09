import { createRetrieveLocationRequest, createRetrieveSingleTicketRequest } from './api'
import type { OmnivoreAPIClient } from './api'
import { LocationResponse, SingleTicketResponse } from './types'

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

type DiscountParams = TicketParams & {
  discountID: string
}

export type OmnivoreService = {
  retrieveLocation: () => Observable<LocationResponse | undefined>
  retrieveSingleTicket: (params: TicketParams) => Observable<SingleTicketResponse | undefined>
  getAllTickets: (params: BaseParams) => Observable<SingleTicketResponse[]>
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
  return {
    retrieveLocation,
    retrieveSingleTicket,
    getAllTickets,
  }
}
