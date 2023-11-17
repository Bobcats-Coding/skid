import type { Fetcher, RestClient, RestEndpoint, RestEndpointRequest } from './service'
import { createRestClientCreator } from './service'

import { type JsonType } from '@bobcats-coding/skid/core/type'

export const jsonFetcher: Fetcher<JsonType | Error> = async (url, request) =>
  await (await fetch(url, {
    ...request,
    headers: {
      ...request.headers,
      ...(request.body !== undefined && { 'Content-Type': 'application/json' })
    },
    body: request.body !== undefined ? JSON.stringify(request.body) : null,
  })).json()

export const createJsonRestClient = createRestClientCreator(jsonFetcher)

export type JsonRestClient<API extends RestEndpoint<RestEndpointRequest, JsonType | Error>> =
  RestClient<Fetcher<JsonType | Error>, API>
