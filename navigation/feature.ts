import type { NavigationCommand } from './command'
import { navigationCommand } from './command'
import { navigationEffect } from './effect'
import type { NavigationQuery } from './query'
import { navigationQuery } from './query'
import type { NavigationService } from './service'
import type { NavigationEvent, NavigationState } from './store'

import type { CoreEvent, CoreStore } from '@bobcats-coding/skid/core/store'

type NavigationFeatureArgs<APP_STORE_EVENT extends CoreEvent> = {
  store: CoreStore<{ navigation: NavigationState }, APP_STORE_EVENT>
  navigationService: NavigationService
}

export type NavigationFeature = NavigationQuery & NavigationCommand

export const createNavigation = <APP_STORE_EVENT extends CoreEvent>({
  store,
  navigationService,
}: NavigationFeatureArgs<APP_STORE_EVENT | NavigationEvent>): NavigationFeature => {
  const query = navigationQuery(store)
  const command = navigationCommand(store)
  const { handleAppNavigation, handlePlatformNavigation } = navigationEffect<{
    navigation: NavigationState
  }>(navigationService)

  store.registerEffect(handleAppNavigation)
  store.registerEffect(handlePlatformNavigation)

  return {
    ...command,
    ...query,
  }
}
