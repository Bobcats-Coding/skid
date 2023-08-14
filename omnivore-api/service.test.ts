import { createOmnivoreService } from './service'
import { FAKE_LOCATION, omnivoreAPIClient } from './stub'
import type { LocationResponse } from './types'

import { coreMarbles } from '@bobcats-coding/skid/core/marbles'

import type { Observable } from 'rxjs'
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
