import { createOmnivoreService } from './service'
import { FAKE_LOCATION, FAKE_TICKET, FAKE_TICKETS, omnivoreAPIClient } from './stub'
import type { GetAllTicketsResponse, LocationResponse, SingleTicketResponse } from './types'

import { coreMarbles } from '@bobcats-coding/skid/core/marbles'

import { filter, map } from 'rxjs/operators'

const omnivoreService = createOmnivoreService(omnivoreAPIClient, {
  apiKey: 'fake-api-key',
  locationID: 'loc123',
})

test(
  'retrieve location information',
  coreMarbles(({ expect }) => {
    const locations$ = omnivoreService.retrieveLocation().pipe(
      map((response) => {
        return response
      }),
      filter((loc): loc is LocationResponse => {
        return loc !== null
      }),
    )
    const displayName$ = locations$.pipe(map((location) => location))
    expect(displayName$).toBeObservable('-(n|)', { n: FAKE_LOCATION })
  }),
)

test(
  'retrieve single ticket information',
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
    const displayName$ = ticket$.pipe(map((ticketResponse) => ticketResponse))
    expect(displayName$).toBeObservable('-(n|)', { n: FAKE_TICKET })
  }),
)

test(
  'get all tickets based on location',
  coreMarbles(({ expect }) => {
    const ticket$ = omnivoreService.getAllTickets().pipe(
      map((response) => {
        return response
      }),
      filter((tic): tic is GetAllTicketsResponse => {
        return tic !== null
      }),
    )
    const displayName$ = ticket$.pipe(map((ticketResponse) => ticketResponse))
    expect(displayName$).toBeObservable('-(n|)', { n: FAKE_TICKETS })
  }),
)
