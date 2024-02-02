import type { Location } from './type'

import type { History, Location as HistoryLocation } from 'history'
import { fromEventPattern, merge, of } from 'rxjs'
import type { Observable } from 'rxjs'
import { delay } from 'rxjs/operators'

export type NavigationService = {
  getLocation: () => Location
  push: (location: Location) => void
  location$: Observable<Location>
}

export const createNavigationService = (history: History): NavigationService => {
  return {
    getLocation() {
      return toLocation(history.location)
    },
    push(location: Location) {
      if (history.location.pathname === location.pathname) {
        return
      }
      history.push(toHistoryLocation(location))
    },
    location$: merge(
      fromEventPattern(
        (handler) => history.listen(handler),
        (_, cancel) => cancel(),
        ({ location }: { location: HistoryLocation }) => toLocation(location),
      ),
      of(toLocation(history.location)).pipe(delay(0)),
    ),
  }
}

const toHistoryLocation = ({ pathname, hash, search }: Location): Partial<HistoryLocation> => ({
  pathname,
  hash,
  search,
})

const toLocation = ({ pathname, hash, search }: HistoryLocation): Location => ({
  pathname,
  hash,
  search,
})
