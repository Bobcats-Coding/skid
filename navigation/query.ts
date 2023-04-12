import type { RouteMatch, Router } from './router'
import { createRouter } from './router'
import { AppStoreNavigationStateSlice, stateToNavigation } from './store'
import type { Location } from './type'

import type { StateReadable } from '@bobcats-coding/skid/core/store'

import type { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export type NavigationQuery = {
  location$: Observable<Location>
  route$: Observable<RouteMatch | undefined>
}

const defaultRouter = createRouter([])

export const navigationQuery = (
  store: StateReadable<AppStoreNavigationStateSlice>,
  router: Router = defaultRouter,
): NavigationQuery => ({
  location$: store.state$.pipe(map(stateToNavigation)),
  route$: store.state$.pipe(
    map(stateToNavigation),
    map((location) => router.resolve(location)),
  ),
})
