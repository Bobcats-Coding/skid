import { getStateReadable } from './fake'
import { navigationQuery } from './query'
import { createRouter } from './router'

import { coreMarbles } from '@bobcats-coding/skid/core/marbles'

test(
  'location$ should give the current location',
  coreMarbles(({ expect, cold }) => {
    const { location$ } = navigationQuery(
      getStateReadable(
        cold('l', {
          l: {
            pathname: '/path',
            search: 'a=1&b=2',
            hash: 'some',
          },
        }),
      ),
    )
    expect(location$).toBeObservable('l', {
      l: {
        pathname: '/path',
        search: 'a=1&b=2',
        hash: 'some',
      },
    })
  }),
)

test(
  'route$ should give the current route',
  coreMarbles(({ expect, cold }) => {
    const router = createRouter([
      {
        route: '/path/:id',
        id: 'PATH',
      },
    ])
    const { route$ } = navigationQuery(
      getStateReadable(
        cold('l', {
          l: {
            pathname: '/path/1',
            search: 'a=1&b=2',
            hash: 'some',
          },
        }),
      ),
      router,
    )
    expect(route$).toBeObservable('l', {
      l: {
        id: 'PATH',
        route: '/path/:id',
        pathname: '/path/1',
        search: new URLSearchParams('a=1&b=2'),
        hash: 'some',
        params: { id: '1' },
      },
    })
  }),
)
