import type { Fetcher, RestClient, RestEndpoint } from './service'
import type { StubEndpoint } from './stub'
import { createStubRestClient } from './stub'

import { coreMarbles } from '@bobcats-coding/skid/core/marbles'
import { type JsonType } from '@bobcats-coding/skid/core/type'

import type { Observable } from 'rxjs'

test(
  'the stub should be usable as client',
  coreMarbles(({ expect }) => {
    type Client = RestClient<Fetcher<JsonType>, Api>
    /* eslint-disable @typescript-eslint/explicit-function-return-type */
    const createService = (client: Client) => {
      const search: Record<'a', string> = { a: '1' } as const
      const headers: Record<'header-1', 'value-1'> = {
        'header-1': 'value-1',
      } as const
      return client({
        method: 'GET',
        pathname: '/path',
        search,
        headers,
      } as const)
    }
    /* eslint-enable @typescript-eslint/explicit-function-return-type */
    type Response = { a: number }
    type Response2 = { b: number }
    type Response3 = { c: number }
    type Response4 = { d: number }
    type Endpoint = RestEndpoint<
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
    type Endpoint2 = RestEndpoint<
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
    type Endpoint3 = RestEndpoint<
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
    type Endpoint4 = RestEndpoint<
      {
        method: 'GET'
        pathname: '/path'
        search: {
          a: string
        }
        headers: {
          'header-1': 'value-2'
        }
      },
      Response4
    >
    type Api = Endpoint | Endpoint2 | Endpoint3 | Endpoint4
    const endpoint: StubEndpoint<Endpoint> = {
      request: {
        method: 'GET',
        pathname: '/path',
        search: {
          a: '1',
        },
        headers: {
          'header-1': 'value-1',
        },
      },
      response: { a: 1 },
    } as const
    const endpoint2: StubEndpoint<Endpoint2> = {
      request: {
        method: 'GET',
        pathname: '/path',
        search: {
          b: '1',
        },
        headers: {
          'header-1': 'value-2',
        },
      },
      response: { b: 1 },
    } as const
    const endpoint3: StubEndpoint<Endpoint3> = {
      request: {
        method: 'GET',
        pathname: '/path',
        search: {
          b: '1',
        },
        headers: {
          'header-1': 'value-1',
        },
      },
      response: { c: 1 },
    } as const
    const endpoint4: StubEndpoint<Endpoint4> = {
      request: {
        method: 'GET',
        pathname: '/path',
        search: {
          a: '1',
        },
        headers: {
          'header-1': 'value-2',
        },
      },
      response: { d: 1 },
    } as const
    const endpoints = [endpoint, endpoint2, endpoint3, endpoint4] as const
    const stub = createStubRestClient<Api, typeof endpoints>(endpoints)
    const service = createService(stub)
    service satisfies Observable<Response>
    // @ts-expect-error it is not Response2
    service satisfies Observable<Response2>
    // @ts-expect-error it is not Response3
    service satisfies Observable<Response3>
    // @ts-expect-error it is not Response4
    service satisfies Observable<Response4>
    expect(service).toBeObservable('-(a|)', {
      a: { a: 1 },
    })
  }),
)

test(
  'the stub should select based method',
  coreMarbles(({ expect }) => {
    type Response = { a: number }
    type Response2 = { b: number }
    type Endpoint = RestEndpoint<
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
    type Endpoint2 = RestEndpoint<
      {
        method: 'POST'
        pathname: '/path'
        search: {
          a: string
        }
        headers: {
          'header-1': 'value-1'
        }
      },
      Response2
    >
    type Api = Endpoint | Endpoint2
    const endpoint: StubEndpoint<Endpoint> = {
      request: {
        method: 'GET',
        pathname: '/path',
        search: {
          a: '1',
        },
        headers: {
          'header-1': 'value-1',
        },
      },
      response: { a: 1 },
    } as const
    const endpoint2: StubEndpoint<Endpoint2> = {
      request: {
        method: 'POST',
        pathname: '/path',
        search: {
          a: '1',
        },
        headers: {
          'header-1': 'value-1',
        },
      },
      response: { b: 1 },
    } as const
    const endpoints = [endpoint, endpoint2] as const
    const client = createStubRestClient<Api, typeof endpoints>(endpoints)
    const search: Record<'a', string> = { a: '1' } as const
    const headers: Record<'header-1', 'value-1'> = {
      'header-1': 'value-1',
    } as const
    const response = client({
      method: 'POST',
      pathname: '/path',
      search,
      headers,
    } as const)
    response satisfies Observable<Response2>
    // @ts-expect-error it is not Response
    response satisfies Observable<Response>
    expect(response).toBeObservable('-(b|)', {
      b: { b: 1 },
    })
  }),
)

test(
  'the stub should select based on pathname',
  coreMarbles(({ expect }) => {
    type Response = { a: number }
    type Response2 = { b: number }
    type Endpoint = RestEndpoint<
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
    type Endpoint2 = RestEndpoint<
      {
        method: 'GET'
        pathname: '/path2'
        search: {
          a: string
        }
        headers: {
          'header-1': 'value-1'
        }
      },
      Response2
    >
    type Api = Endpoint | Endpoint2
    const endpoint: StubEndpoint<Endpoint> = {
      request: {
        method: 'GET',
        pathname: '/path',
        search: {
          a: '1',
        },
        headers: {
          'header-1': 'value-1',
        },
      },
      response: { a: 1 },
    } as const
    const endpoint2: StubEndpoint<Endpoint2> = {
      request: {
        method: 'GET',
        pathname: '/path2',
        search: {
          a: '1',
        },
        headers: {
          'header-1': 'value-1',
        },
      },
      response: { b: 1 },
    } as const
    const endpoints = [endpoint, endpoint2] as const
    const client = createStubRestClient<Api, typeof endpoints>(endpoints)
    const search: Record<'a', string> = { a: '1' } as const
    const headers: Record<'header-1', 'value-1'> = {
      'header-1': 'value-1',
    } as const
    const response = client({
      method: 'GET',
      pathname: '/path2',
      search,
      headers,
    } as const)
    response satisfies Observable<Response2>
    // @ts-expect-error it is not Response
    response satisfies Observable<Response>
    expect(response).toBeObservable('-(b|)', {
      b: { b: 1 },
    })
  }),
)

test(
  'the stub should select based on search',
  coreMarbles(({ expect }) => {
    type Response = { a: number }
    type Response2 = { b: number }
    type Endpoint = RestEndpoint<
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
    type Endpoint2 = RestEndpoint<
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
      Response2
    >
    type Api = Endpoint | Endpoint2
    const endpoint: StubEndpoint<Endpoint> = {
      request: {
        method: 'GET',
        pathname: '/path',
        search: {
          a: '1',
        },
        headers: {
          'header-1': 'value-1',
        },
      },
      response: { a: 1 },
    } as const
    const endpoint2: StubEndpoint<Endpoint2> = {
      request: {
        method: 'GET',
        pathname: '/path',
        search: {
          b: '1',
        },
        headers: {
          'header-1': 'value-1',
        },
      },
      response: { b: 1 },
    } as const
    const endpoints = [endpoint, endpoint2] as const
    const client = createStubRestClient<Api, typeof endpoints>(endpoints)
    const search: Record<'b', string> = { b: '1' } as const
    const headers: Record<'header-1', 'value-1'> = {
      'header-1': 'value-1',
    } as const
    const response = client({
      method: 'GET',
      pathname: '/path',
      search,
      headers,
    } as const)
    response satisfies Observable<Response2>
    // @ts-expect-error it is not Response
    response satisfies Observable<Response>
    expect(response).toBeObservable('-(b|)', {
      b: { b: 1 },
    })
  }),
)

test(
  'the stub should select based on headers',
  coreMarbles(({ expect }) => {
    type Response = { a: number }
    type Response2 = { b: number }
    type Endpoint = RestEndpoint<
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
    type Endpoint2 = RestEndpoint<
      {
        method: 'GET'
        pathname: '/path'
        search: {
          a: string
        }
        headers: {
          'header-1': 'value-2'
        }
      },
      Response2
    >
    type Api = Endpoint | Endpoint2
    const endpoint: StubEndpoint<Endpoint> = {
      request: {
        method: 'GET',
        pathname: '/path',
        search: {
          a: '1',
        },
        headers: {
          'header-1': 'value-1',
        },
      },
      response: { a: 1 },
    } as const
    const endpoint2: StubEndpoint<Endpoint2> = {
      request: {
        method: 'GET',
        pathname: '/path',
        search: {
          a: '1',
        },
        headers: {
          'header-1': 'value-2',
        },
      },
      response: { b: 1 },
    } as const
    const endpoints = [endpoint, endpoint2] as const
    const client = createStubRestClient<Api, typeof endpoints>(endpoints)
    const search: Record<'a', string> = { a: '1' } as const
    const headers: Record<'header-1', 'value-2'> = {
      'header-1': 'value-2',
    } as const
    const response = client({
      method: 'GET',
      pathname: '/path',
      search,
      headers,
    } as const)
    response satisfies Observable<Response2>
    // @ts-expect-error it is not Response
    response satisfies Observable<Response>
    expect(response).toBeObservable('-(b|)', {
      b: { b: 1 },
    })
  }),
)

test(
  'the stub respect the delay',
  coreMarbles(({ expect }) => {
    type Response = { a: number }
    type Endpoint = RestEndpoint<
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
    type Api = Endpoint
    const endpoint: StubEndpoint<Endpoint> = {
      request: {
        method: 'GET',
        pathname: '/path',
        search: {
          a: '1',
        },
        headers: {
          'header-1': 'value-1',
        },
      },
      response: { a: 1 },
      delay: 3,
    } as const
    const endpoints = [endpoint] as const
    const client = createStubRestClient<Api, typeof endpoints>(endpoints)
    const search: Record<'a', string> = { a: '1' } as const
    const headers: Record<'header-1', 'value-1'> = {
      'header-1': 'value-1',
    } as const
    const response = client({
      method: 'GET',
      pathname: '/path',
      search,
      headers,
    } as const)
    expect(response).toBeObservable('---(a|)', {
      a: { a: 1 },
    })
  }),
)
