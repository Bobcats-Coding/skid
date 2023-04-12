import { navigationEffect } from './effect'
import { createNavigationServiceFake as createNavigationService } from './fake'
import { createAppNavigation, createChangeLocation, createPlatformNavigation } from './store'

import { coreMarbles } from '@bobcats-coding/skid/core/marbles'

import { of } from 'rxjs'

test(
  'app navigation',
  coreMarbles(({ expect, cold }) => {
    const LOCATION = {
      pathname: '/hello',
      search: 'a=1&b=2',
      hash: 'some',
    }
    const APP_NAVIGATION = createAppNavigation(LOCATION)
    const CHANGE_LOCATION = createChangeLocation(LOCATION)
    const navigationService = createNavigationService()
    const effect = navigationEffect(navigationService)
    const event$ = cold('-s', { s: APP_NAVIGATION })
    expect(effect.handleAppNavigation(event$, STATE$)).toBeObservable('-p', {
      p: CHANGE_LOCATION,
    })
    expect(navigationService.location$).toBeObservable('01', {
      0: DEFAULT_LOCATION,
      1: LOCATION,
    })
  }),
)

test(
  'platform navigation',
  coreMarbles(({ expect, cold }) => {
    const LOCATION = {
      pathname: '/',
      search: '',
      hash: '',
    }
    const PLATFORM_NAVIGATION = createPlatformNavigation(LOCATION)
    const CHANGE_LOCATION = createChangeLocation(LOCATION)
    const navigationService = createNavigationService()
    const effect = navigationEffect(navigationService)
    expect(effect.handlePlatformNavigation(cold('', {}), STATE$)).toBeObservable('(pc)', {
      p: PLATFORM_NAVIGATION,
      c: CHANGE_LOCATION,
    })
  }),
)

const DEFAULT_LOCATION = {
  pathname: '/',
  search: '',
  hash: '',
}

const STATE$ = of(undefined)
