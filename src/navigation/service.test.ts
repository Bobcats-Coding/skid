import { createNavigationService } from './service'

import { coreMarbles } from '@bobcats-coding/skid/core/marbles'

import { createMemoryHistory } from 'history'

test('get empty location', () => {
  const navigation = createNavigationService(createMemoryHistory())
  const location = navigation.getLocation()
  expect(location).toEqual({
    pathname: '/',
    search: '',
    hash: '',
  })
})

test('parse location search', () => {
  const navigation = createNavigationService(createMemoryHistory())
  navigation.push({
    pathname: '/latest',
    search: 'a=1&b=2',
    hash: 'some',
  })
  const location = navigation.getLocation()
  expect(location).toEqual({
    pathname: '/latest',
    search: 'a=1&b=2',
    hash: 'some',
  })
})

test(
  'location change stream',
  coreMarbles(({ expect, coldCall }) => {
    const history = createMemoryHistory()
    const navigation = createNavigationService(history)
    coldCall('-hl', {
      l: () => {
        navigation.push(LATEST_LOCATION)
      },
      h: () => {
        history.push(LATEST_LOCATION)
      },
    })
    expect(navigation.location$).toBeObservable('01', {
      0: DEFAULT_LOCATION,
      1: LATEST_LOCATION,
    })
  }),
)

const LATEST_LOCATION = {
  pathname: '/latest',
  search: 'a=1&b=2',
  hash: 'some',
}

const DEFAULT_LOCATION = {
  pathname: '/',
  search: '',
  hash: '',
}
