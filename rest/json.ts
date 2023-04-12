import type { Fetcher, RestClient, RestEndpoint, RestEndpointRequest } from './service'
import { createRestClientCreator } from './service'

import { JsonType } from '@bobcats-coding/skid/core/type'

export const jsonFetcher: Fetcher<JsonType | Error> = async (url, request) =>
  await (await fetch(url, request)).json()

export const createJsonRestClient = createRestClientCreator(jsonFetcher)

export type JsonRestClient<API extends RestEndpoint<RestEndpointRequest, JsonType | Error>> =
  RestClient<Fetcher<JsonType | Error>, API>
