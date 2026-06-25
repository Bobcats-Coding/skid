import type { Fetcher, RestClient, RestEndpoint, RestEndpointRequest } from './service'
import { createRestClientCreator } from './service'

import { type JsonType } from '@bobcats-coding/skid/core/type'

export const jsonFetcher: Fetcher<JsonType | Error> = async (url, request) => {
  const response = await fetch(url, {
    ...request,
    headers: {
      ...request.headers,
      ...(request.body !== undefined && { 'Content-Type': 'application/json' }),
    },
    body: request.body !== undefined ? JSON.stringify(request.body) : null,
  })
  // This is temporary, we should have a better way to handle this, like a proper logger
  const isRooamRequest = url.includes('rooam')
  const responseText = isRooamRequest ? '[Rooam response omitted]' : await response.clone().text()

  if (!response.ok) {
    console.error(response.url, response.status, responseText, request.body)
    if (request.body !== undefined) {
      console.dir(request.body, { depth: null })
    }
  } else {
    console.info(response.url, response.status, responseText, request.body)
    if (request.body !== undefined) {
      console.dir(request.body, { depth: null })
    }
  }
  return await response.json()
}

export const createJsonRestClient = createRestClientCreator(jsonFetcher)

export type JsonRestClient<API extends RestEndpoint<RestEndpointRequest, JsonType | Error>> =
  RestClient<Fetcher<JsonType | Error>, API>
