import type { Fetcher, RestEndpoint } from './service'
import { createRestClientCreator } from './service'

import type { JsonType } from '@bobcats-coding/skid/core/type'

import { firstValueFrom, type Observable } from 'rxjs'

test('the client should return the narrowed type by the request config', () => {
  const createRestClient = createRestClientCreator(JSON_FETCHER_WITH_TEST_RESPONSE)
  type Api =
    | RestEndpoint<GetRequestWithPath, Response>
    | RestEndpoint<GetRequestWithPath2, Response2>
  const client = createRestClient<Api>('https', 'host')
  client({
    method: 'GET',
    pathname: '/path',
  } as const) satisfies Observable<Response>
  client({
    method: 'GET',
    pathname: '/path',
    // @ts-expect-error it is not Response2
  } as const) satisfies Observable<Response2>
})

test('the request config type should be required', () => {
  const createRestClient = createRestClientCreator(JSON_FETCHER_WITH_TEST_RESPONSE)
  type Api =
    // @ts-expect-error cannot be undefined
    RestEndpoint<undefined, Response>
  // @ts-expect-error not a valid request config
  createRestClient<Api>('host')
})

test('the client should return the narrowed type by the request config', async () => {
  const createRestClient = createRestClientCreator(JSON_FETCHER_WITH_TEST_RESPONSE)
  type Response = { a: number }
  type Api = RestEndpoint<GetRequestWithPath, Response>
  const client = createRestClient<Api>('https', 'host')
  const response = await firstValueFrom(client({ method: 'GET', pathname: '/path' }))
  expect(response).toEqual(TEST_RESPONSE)
})

test('the rest client should expect RestEndpoints', () => {
  const createRestClient = createRestClientCreator(JSON_FETCHER_WITH_TEST_RESPONSE)
  // @ts-expect-error not a valid request config
  createRestClient<string>('host')
})

test('the fetcher type should narrow the possible response types', () => {
  const createRestClient = createRestClientCreator(JSON_FETCHER_WITH_TEST_RESPONSE)
  type Api = RestEndpoint<GetRequestWithPath, () => void>
  // @ts-expect-error not a valid fetcher
  createRestClient<Api>('https', 'host')
})

test('the response type should be dependent on the method', () => {
  const createRestClient = createRestClientCreator(JSON_FETCHER_WITH_TEST_RESPONSE)
  type Api =
    | RestEndpoint<GetRequestWithPath, Response>
    | RestEndpoint<PostRequestWithPath, Response2>
  const client = createRestClient<Api>('https', 'host')
  client({
    method: 'POST',
    pathname: '/path',
  } as const) satisfies Observable<Response2>
})

test('all request params should be passed to the fetcher', async () => {
  const fetcher: Fetcher<JsonType> = async (url, { method, headers = {} }) =>
    await Promise.resolve({ method, url, headers })
  const createRestClient = createRestClientCreator(fetcher)
  type Response = { a: number }
  type Response2 = { b: string }
  type Api =
    | RestEndpoint<
        {
          method: 'POST'
          pathname: '/path'
          search: {
            a: number
          }
          headers: {
            'header-1': 'value-1'
          }
        },
        Response
      >
    | RestEndpoint<
        {
          method: 'POST'
          pathname: '/path'
          search: {
            b: number
          }
          headers: {
            'header-1': 'value-1'
          }
        },
        Response2
      >
  const client = createRestClient<Api>('https', 'host')
  const search: Record<'a', number> = { a: 1 } as const
  const headers: Record<'header-1', 'value-1'> = {
    'header-1': 'value-1',
  } as const
  const response = await firstValueFrom(
    client({
      method: 'POST',
      pathname: '/path',
      search,
      headers,
    } as const),
  )
  expect(response).toEqual({
    method: 'POST',
    url: 'https://host/path?a=1',
    headers: {
      'header-1': 'value-1',
    },
  })
})

test('the client should return the narrowed type by the request config', () => {
  const createRestClient = createRestClientCreator(JSON_FETCHER_WITH_TEST_RESPONSE)
  type Response = { a: number }
  type Response2 = { b: string }
  type Response3 = { c: string }
  type Response4 = { d: string }
  type Api =
    | RestEndpoint<
        {
          method: 'GET'
          pathname: '/path'
          search: {
            a: string
          }
          headers: {
            'header-1': 'value-1'
          }
        },
        Response
      >
    | RestEndpoint<
        {
          method: 'GET'
          pathname: '/path'
          search: {
            b: string
          }
          headers: {
            'header-1': 'value-2'
          }
        },
        Response2
      >
    | RestEndpoint<
        {
          method: 'GET'
          pathname: '/path'
          search: {
            b: string
          }
          headers: {
            'header-1': 'value-1'
          }
        },
        Response3
      >
    | RestEndpoint<
        {
          method: 'GET'
          pathname: '/path'
          search: {
            b: string
          }
          headers: {
            'header-1': 'value-2'
          }
        },
        Response4
      >
  const client = createRestClient<Api>('https', 'host')
  const search: Record<'a', string> = { a: '1' } as const
  const headers: Record<'header-1', 'value-1'> = {
    'header-1': 'value-1',
  } as const
  client({
    method: 'GET',
    pathname: '/path',
    search,
    headers,
  } as const) satisfies Observable<Response>
  client({
    method: 'GET',
    pathname: '/path',
    search,
    headers,
    // @ts-expect-error it is not Response2
  } as const) satisfies Observable<Response2>
  client({
    method: 'GET',
    pathname: '/path',
    search,
    headers,
    // @ts-expect-error it is not Response3
  } as const) satisfies Observable<Response3>
  client({
    method: 'GET',
    pathname: '/path',
    search,
    headers,
    // @ts-expect-error it is not Response4
  } as const) satisfies Observable<Response4>
})

test('the client should only allow valid type requests', () => {
  const createRestClient = createRestClientCreator(JSON_FETCHER_WITH_TEST_RESPONSE)
  type Response = { a: number }
  type Api = RestEndpoint<
    {
      method: 'GET'
      pathname: '/path'
      search: {
        a: string
      }
      headers: {
        'header-1': 'value-1'
      }
    },
    Response
  >
  const client = createRestClient<Api>('https', 'host')
  const search: Record<'a', string> = { a: '1' } as const
  const headers: Record<'header-1', 'value-1'> = {
    'header-1': 'value-1',
  } as const
  client({
    method: 'GET',
    // @ts-expect-error not a valid pathname
    pathname: '/path2',
    search,
    headers,
  })
  client({
    // @ts-expect-error not a valid method
    method: 'POST',
    pathname: '/path',
    search,
    headers,
  })
  // @ts-expect-error not a valid search
  client({
    method: 'GET',
    pathname: '/path',
    search,
  })
  // @ts-expect-error not a valid headers
  client({
    method: 'GET',
    pathname: '/path',
    headers,
  })
})

test('the awaited value should be narrowed', async () => {
  const createRestClient = createRestClientCreator(JSON_FETCHER_WITH_TEST_RESPONSE)
  type Api =
    | RestEndpoint<GetRequestWithPath, Response>
    | RestEndpoint<GetRequestWithPath2, Response2>
  const client = createRestClient<Api>('https', 'host')
  const response = await firstValueFrom(client({ method: 'GET', pathname: '/path' } as const))
  response satisfies Response
  // @ts-expect-error it is not Response2
  response satisfies Response2
})

const TEST_RESPONSE = { a: 3 }
const JSON_FETCHER_WITH_TEST_RESPONSE: Fetcher<JsonType> = async () =>
  await Promise.resolve(TEST_RESPONSE)

type GetRequestWithPath = {
  method: 'GET'
  pathname: '/path'
}

type GetRequestWithPath2 = {
  method: 'GET'
  pathname: '/path2'
}

type PostRequestWithPath = {
  method: 'POST'
  pathname: '/path'
}

type Response = { a: number }
type Response2 = { b: number }
