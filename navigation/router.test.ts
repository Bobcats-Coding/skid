import { createRouter } from './router'

test('Route not found', () => {
  const router = createRouter([])
  const resolve = (): void => {
    router.resolve({
      pathname: '/',
      search: '',
      hash: '',
    })
  }
  expect(resolve).toThrow('Route not found: "/"')
})

test('Resolve route', () => {
  const router = createRouter([
    {
      route: '/',
      id: 'INDEX',
    },
  ])
  const resolved = router.resolve({
    pathname: '/',
    search: '',
    hash: '',
  })
  expect(resolved).toEqual({
    id: 'INDEX',
    route: '/',
    pathname: '/',
    search: new URLSearchParams(''),
    hash: '',
    params: {},
  })
})

test('Resolve route params', () => {
  const router = createRouter([
    {
      route: '/:id',
      id: 'INDEX',
    },
  ])
  const resolved = router.resolve({
    pathname: '/1',
    search: 'a=1&b=2',
    hash: 'hash',
  })
  expect(resolved).toEqual({
    id: 'INDEX',
    route: '/:id',
    pathname: '/1',
    search: new URLSearchParams('a=1&b=2'),
    hash: 'hash',
    params: { id: '1' },
  })
})

test('Match route by id: match', () => {
  const router = createRouter([
    {
      route: '/:id',
      id: 'INDEX',
    },
  ])
  const match = router.match(
    {
      pathname: '/1',
      search: 'a=1&b=2',
      hash: 'hash',
    },
    'INDEX',
  )
  expect(match).toEqual({
    id: 'INDEX',
    route: '/:id',
    pathname: '/1',
    search: new URLSearchParams('a=1&b=2'),
    hash: 'hash',
    params: { id: '1' },
  })
})

test('Match route by id: no match', () => {
  const router = createRouter([
    {
      route: '/path/:id',
      id: 'INDEX',
    },
  ])
  const match = router.match(
    {
      pathname: '/1',
      search: '',
      hash: '',
    },
    'INDEX',
  )
  expect(match).toBe(undefined)
})
