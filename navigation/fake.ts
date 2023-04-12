import { NAVIGATION_NAMESPACE } from './config'
import type { NavigationService } from './service'
import { createNavigationService } from './service'
import { navigationReducer } from './store'

import { createStoreTools } from '@bobcats-coding/skid/core/fake'

import { createMemoryHistory } from 'history'

export const createNavigationServiceFake = (): NavigationService =>
  createNavigationService(createMemoryHistory())

export const { createAppStore, getStateReadable } = createStoreTools({
  namespace: NAVIGATION_NAMESPACE,
  reducer: navigationReducer,
})

export const baseStore = { [NAVIGATION_NAMESPACE]: navigationReducer }
