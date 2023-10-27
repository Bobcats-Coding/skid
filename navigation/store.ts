import { NAVIGATION_NAMESPACE } from './config'
import type { Location } from './type'

import {
  createCoreStoreSlice,
  identityReducer,
  type NamespacedState,
  type NamespacedStoreEvent,
} from '@bobcats-coding/skid/core/store'

export type NavigationState = Location

type NavigationStoreEvent<SUB_TYPE extends string, PAYLOAD = undefined> = NamespacedStoreEvent<
  typeof NAVIGATION_NAMESPACE,
  SUB_TYPE,
  PAYLOAD
>

export type NavigationEventChangeLocation = NavigationStoreEvent<'changeLocation', Location>

export type NavigationEventAppNavigation = NavigationStoreEvent<'appNavigation', Location>

export type NavigationEventPlatformNavigation = NavigationStoreEvent<'platformNavigation', Location>

export type NavigationEvent =
  | NavigationEventChangeLocation
  | NavigationEventAppNavigation
  | NavigationEventPlatformNavigation

const changeLocation = (
  _: NavigationState,
  event: NavigationEventChangeLocation,
): NavigationState => ({
  ...event.payload,
})

const reducers = {
  changeLocation,
  appNavigation: identityReducer<NavigationState, NavigationEventAppNavigation>,
  platformNavigation: identityReducer<NavigationState, NavigationEventPlatformNavigation>,
}

const initialState = {
  pathname: '/',
  search: '',
  hash: '',
}

const navigationSlice = createCoreStoreSlice({
  name: NAVIGATION_NAMESPACE,
  initialState,
  reducers,
})

export type AppStoreNavigationStateSlice = NamespacedState<typeof navigationSlice>

export const {
  eventCreators: { createChangeLocation, createAppNavigation, createPlatformNavigation },
  reducer: navigationReducer,
  stateToNavigation,
} = navigationSlice
