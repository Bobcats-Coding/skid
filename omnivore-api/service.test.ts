import { createOmnivoreService } from './service'
import {
  FAKE_LOCATION,
  FAKE_TICKET,
  FAKE_TICKETS,
  omnivoreAPIClient,
  OPEN_TICKET_BODY,
} from './stub'
import type { GetAllTicketsResponse, LocationResponse, SingleTicketResponse } from './types'

import { coreMarbles } from '@bobcats-coding/skid/core/marbles'

import { filter, map } from 'rxjs/operators'

const omnivoreService = createOmnivoreService(omnivoreAPIClient, {
  apiKey: 'fake-api-key',
  locationID: 'loc123',
})

test(
  'Retrieve location information',
  coreMarbles(({ expect }) => {
    const locations$ = omnivoreService.retrieveLocation().pipe(
      map((response) => {
        return response
      }),
      filter((loc): loc is LocationResponse => {
        return loc !== null
      }),
    )
    const currentLocation$ = locations$.pipe(map((location) => location))
    expect(currentLocation$).toBeObservable('-(n|)', { n: FAKE_LOCATION })
  }),
)

test(
  'Retrieve single ticket information',
  coreMarbles(({ expect }) => {
    const ticket$ = omnivoreService
      .retrieveSingleTicket({
        ticketID: 'ticket123',
      })
      .pipe(
        map((response) => {
          return response
        }),
        filter((tic): tic is SingleTicketResponse => {
          return tic !== null
        }),
      )
    const ticketInfo$ = ticket$.pipe(map((ticketResponse) => ticketResponse))
    expect(ticketInfo$).toBeObservable('-(n|)', { n: FAKE_TICKET })
  }),
)

test(
  'Get all tickets based on location',
  coreMarbles(({ expect }) => {
    const ticket$ = omnivoreService.getAllTickets().pipe(
      map((response) => {
        return response
      }),
      filter((tic): tic is GetAllTicketsResponse => {
        return tic !== null
      }),
    )
    const ticketsAtLocation$ = ticket$.pipe(map((ticketResponse) => ticketResponse))
    expect(ticketsAtLocation$).toBeObservable('-(n|)', { n: FAKE_TICKETS })
  }),
)

test(
  'Open new ticket',
  coreMarbles(({ expect }) => {
    const ticket$ = omnivoreService.openTicket({ body: OPEN_TICKET_BODY }).pipe(
      map((response) => {
        return response
      }),
      filter((tic): tic is SingleTicketResponse => {
        return tic !== null
      }),
    )
    const openedTicket$ = ticket$.pipe(map((ticketResponse) => ticketResponse))
    expect(openedTicket$).toBeObservable('-(n|)', { n: FAKE_TICKET })
  }),
)
