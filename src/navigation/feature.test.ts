import { NAVIGATION_NAMESPACE } from './config'
import { createAppStore, createNavigationServiceFake as createNavigationService } from './fake'
import { createNavigation } from './feature'

import { coreMarbles } from '@bobcats-coding/skid/core/marbles'

test(
  'handle app navigations',
  coreMarbles(({ expect, coldCall }) => {
    const { store } = createAppStore()
    const navigationService = createNavigationService()
    const { appNavigation, location$ } = createNavigation({
      store,
      navigationService,
    })
    coldCall('-1', {
      1: () => {
        appNavigation({
          pathname: '/path',
          search: 'a=1&b=2',
          hash: 'some',
        })
      },
    })
    expect(location$).toBeObservable('01', {
      0: {
        pathname: '/',
        search: '',
        hash: '',
      },
      1: {
        pathname: '/path',
        search: 'a=1&b=2',
        hash: 'some',
      },
    })
  }),
)

test(
  'handle platform navigations',
  coreMarbles(({ expect, coldCall }) => {
    const { store } = createAppStore()
    const navigationService = createNavigationService()
    createNavigation({ store, navigationService })
    coldCall('1', {
      1: () => {
        navigationService.push({
          pathname: '/path',
          search: 'a=1&b=2',
          hash: 'some',
        })
      },
    })
    expect(store.state$).toBeObservable('l', {
      l: {
        [NAVIGATION_NAMESPACE]: {
          pathname: '/path',
          search: 'a=1&b=2',
          hash: 'some',
        },
      },
    })
  }),
)
