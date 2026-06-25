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

type ParsedBaseUrl = {
  protocol: string
  hostname: string
  port: number | undefined
  basePath: string
}

const parseBaseUrl = (baseUrl: string): ParsedBaseUrl => {
  const url = new URL(baseUrl)
  if (url.search !== '') {
    throw new Error(`baseUrl must not contain a query string: ${baseUrl}`)
  }
  if (url.hash !== '') {
    throw new Error(`baseUrl must not contain a hash fragment: ${baseUrl}`)
  }
  const rawPath = url.pathname
  const basePath = rawPath.endsWith('/') ? rawPath.slice(0, -1) : rawPath
  return {
    protocol: url.protocol.replace(/:$/, ''),
    hostname: url.hostname,
    port: url.port !== '' ? Number(url.port) : undefined,
    basePath,
  }
}

export const createRestClientCreator =
  <FETCHER extends Fetcher>(fetcher: FETCHER) =>
  <API extends RestEndpoint<RestEndpointRequest, GetParsedType<FETCHER>>>(baseUrl: string) => {
    const parsedBase = parseBaseUrl(baseUrl)
    return <REQUEST extends GetRequestType<API>>(
      request: REQUEST,
    ): Observable<GetResponseType<API, REQUEST>> =>
      // The value is unknown that comes from the fetcher, this is the boundary
      // where from the type is set. That is why the casting is necessary
      defer(async () => await fetcher(...getFetcherArg(parsedBase, request))) as Observable<
        GetResponseType<API, REQUEST>
      >
  }

type FetcherConfigArg = {
  method: string
  headers: Record<string, string>
  body: unknown
}

const joinPath = (basePath: string, requestPath: string): string => {
  const normalizedRequest = requestPath.startsWith('/') ? requestPath : `/${requestPath}`
  return `${basePath}${normalizedRequest}`
}

const getFetcherArg = (
  parsedBase: ParsedBaseUrl,
  { pathname, method, search, headers = {}, body = undefined }: RestEndpointRequest,
): [string, FetcherConfigArg] => [
  stringifyUrl({
    protocol: parsedBase.protocol,
    hostname: parsedBase.hostname,
    ...(parsedBase.port !== undefined && { port: parsedBase.port }),
    pathname: joinPath(parsedBase.basePath, pathname),
    search,
  }),
  {
    method,
    headers,
    body,
  },
]
