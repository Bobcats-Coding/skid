import type { Fetcher, RestClient, RestEndpoint, RestEndpointRequest } from './service'
import { createRestClientCreator } from './service'

import querystring, { type ParsedUrlQueryInput } from 'node:querystring'

export const htmlFetcher: Fetcher<string | Error> = async (url, request) => {
  const response = await fetch(url, {
    ...request,
    headers: {
      ...request.headers,
      ...(request.body !== undefined && { 'Content-Type': 'application/x-www-form-urlencoded' }),
    },
    body:
      request.body !== undefined ? querystring.stringify(request.body as ParsedUrlQueryInput) : '',
  })
  // This is temporary, we should have a better way to handle this, like a proper logger
  const isGoogleFormsRequest = url.includes('docs.google.com/forms')
  const responseText = isGoogleFormsRequest
    ? '[Google Forms response omitted]'
    : await response.clone().text()
  if (!response.ok) {
    console.error(response.url, response.status, responseText, request.body)
    console.dir(request.body, { depth: null })
  } else {
    console.info(response.url, response.status, responseText, request.body)
    console.dir(request.body, { depth: null })
  }
  return await response.text()
}

export const createHtmlRestClient = createRestClientCreator(htmlFetcher)

export type HtmlRestClient<API extends RestEndpoint<RestEndpointRequest, string | Error>> =
  RestClient<Fetcher<string | Error>, API>
