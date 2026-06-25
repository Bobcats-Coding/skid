import { diageoNamFetcher } from './fetcher'
import type { InboundSubmissionPayload } from './types'

import { createRestClientCreator, type RestEndpoint } from '@bobcats-coding/skid/rest/service'

const TOKEN_PATHNAME = '/diageo/common/oauth2/provider/token'
const INBOUND_PATHNAME = '/global/tdcdp/common/eapi/api/inbound/sfmc'

type TokenRequestHeaders = {
  Client_ID: string
  Client_Secret: string
  Grant_Type: 'client_credentials'
  'Content-Type': 'application/json'
}

export type TokenRequest = {
  method: 'POST'
  pathname: typeof TOKEN_PATHNAME
  headers: TokenRequestHeaders
  body: { message: 'token request' }
}

export type TokenResponse =
  | {
      access_token: string
      token_type: 'Bearer'
      expires_in: number
    }
  | {
      error: string
      error_description?: string
    }

export type TokenEndpoint = RestEndpoint<TokenRequest, TokenResponse>

type InboundSubmissionHeaders = {
  Authorization: `Bearer ${string}`
  'Content-Type': 'application/json'
}

export type InboundSubmissionRequest = {
  method: 'POST'
  pathname: typeof INBOUND_PATHNAME
  headers: InboundSubmissionHeaders
  body: InboundSubmissionPayload
}

export type InboundSubmissionResponse = Record<string, unknown>

export type InboundSubmissionEndpoint = RestEndpoint<
  InboundSubmissionRequest,
  InboundSubmissionResponse
>

export type DiageoNamAPI = TokenEndpoint | InboundSubmissionEndpoint

const createDiageoNamRestClient = createRestClientCreator(diageoNamFetcher)

export type DiageoNamAPIClient = ReturnType<typeof createDiageoNamRestClient<DiageoNamAPI>>

export const createDiageoNamApiClient = (baseUrl: string): DiageoNamAPIClient => {
  return createDiageoNamRestClient<DiageoNamAPI>(baseUrl)
}

type CreateTokenRequestParams = {
  clientId: string
  clientSecret: string
}

export const createTokenRequest = ({
  clientId,
  clientSecret,
}: CreateTokenRequestParams): TokenRequest => {
  return {
    method: 'POST',
    pathname: TOKEN_PATHNAME,
    headers: {
      Client_ID: clientId,
      Client_Secret: clientSecret,
      Grant_Type: 'client_credentials',
      'Content-Type': 'application/json',
    },
    body: { message: 'token request' },
  }
}

type CreateInboundSubmissionRequestParams = {
  accessToken: string
  body: InboundSubmissionPayload
}

export const createInboundSubmissionRequest = ({
  accessToken,
  body,
}: CreateInboundSubmissionRequestParams): InboundSubmissionRequest => {
  return {
    method: 'POST',
    pathname: INBOUND_PATHNAME,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body,
  }
}
