import type { UrlSearchConfig } from '@bobcats-coding/skid/core/url'
import { stringifyUrl } from '@bobcats-coding/skid/core/url'

import type { Observable } from 'rxjs'
import { defer } from 'rxjs'

export type RestClient<
  FETCHER extends Fetcher,
  API extends RestEndpoint<RestEndpointRequest, GetParsedType<FETCHER>>,
> = <REQUEST extends RestEndpointRequest>(
  request: REQUEST,
) => Observable<GetResponseType<API, REQUEST>>

export type RestEndpointRequest = {
  readonly method: RestMethod
  readonly pathname: string
  readonly search?: UrlSearchConfig
  readonly headers?: Record<string, string>
  readonly body?: unknown
}

type RestMethod =
  | 'GET'
  | 'HEAD'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'CONNECT'
  | 'OPTIONS'
  | 'TRACE'
  | 'PATCH'

export type RestEndpoint<REQUEST extends RestEndpointRequest = any, RESPONSE = any> = {
  request: REQUEST
  response: RESPONSE
}

export type GetResponseType<API, REQUEST extends RestEndpointRequest> =
  API extends RestEndpoint<REQUEST, infer RESPONSE> ? RESPONSE : never

export type GetRequestType<API> = API extends RestEndpoint<infer REQUEST, any> ? REQUEST : never

export type Fetcher<PARSED_TYPE = any> = (
  url: string,
  request: FetcherConfigArg,
) => Promise<PARSED_TYPE>

type GetParsedType<FETCHER extends Fetcher> =
  FETCHER extends Fetcher<infer PARSED_TYPE> ? PARSED_TYPE : never

export const createRestClientCreator =
  <FETCHER extends Fetcher>(fetcher: FETCHER) =>
  <API extends RestEndpoint<RestEndpointRequest, GetParsedType<FETCHER>>>(
    protocol: string,
    host: string,
  ) =>
  <REQUEST extends GetRequestType<API>>(
    request: REQUEST,
  ): Observable<GetResponseType<API, REQUEST>> =>
    // The value is unknown that comes from the fetcher, this is the boundary
    // where from the type is set. That is why the casting is necessary
    defer(async () => await fetcher(...getFetcherArg(protocol, host, request))) as Observable<
      GetResponseType<API, REQUEST>
    >

type FetcherConfigArg = {
  method: string
  headers: Record<string, string>
  body: unknown
}

const getFetcherArg = (
  protocol: string,
  hostname: string,
  { pathname, method, search, headers = {}, body = undefined }: RestEndpointRequest,
): [string, FetcherConfigArg] => [
  stringifyUrl({
    protocol,
    hostname,
    pathname,
    search,
  }),
  {
    method,
    headers,
    body,
  },
]
