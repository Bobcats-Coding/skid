import { NAVIGATION_NAMESPACE } from './config'
import type { NavigationService } from './service'
import { createChangeLocation, createPlatformNavigation } from './store'
import type { NavigationEvent } from './store'

import { CoreEffect, filterByType } from '@bobcats-coding/skid/core/effect'

import { of } from 'rxjs'
import { map, switchMap, tap } from 'rxjs/operators'

type Effects = 'handleAppNavigation' | 'handlePlatformNavigation'

type NavigationEffect<APP_STORE_STATE, APP_STORE_EVENT extends NavigationEvent> = CoreEffect<
  APP_STORE_STATE,
  APP_STORE_EVENT,
  Effects
>

export const navigationEffect = <APP_STORE_STATE>(
  navigationService: NavigationService,
): NavigationEffect<APP_STORE_STATE, NavigationEvent> => ({
  handleAppNavigation: (event$) =>
    event$.pipe(
      filterByType(`${NAVIGATION_NAMESPACE}/appNavigation`),
      tap(({ payload }) => {
        navigationService.push(payload)
      }),
      map(({ payload }) => createChangeLocation(payload)),
    ),
  handlePlatformNavigation: () =>
    navigationService.location$.pipe(
      switchMap((location) =>
        of(createPlatformNavigation(location), createChangeLocation(location)),
      ),
    ),
})
