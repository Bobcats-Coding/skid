import type { NavigationEvent } from './store'
import { createChangeLocation } from './store'
import type { Location } from './type'

import type { EventReceiver } from '@bobcats-coding/skid/core/store'

export type NavigationCommand = {
  appNavigation: (location: Location) => void
}

export const navigationCommand = <APP_STORE_EVENT extends NavigationEvent>(
  appStore: EventReceiver<APP_STORE_EVENT | NavigationEvent>,
): NavigationCommand => ({
  appNavigation: (location: Location) => {
    appStore.send(createChangeLocation(location))
  },
})
