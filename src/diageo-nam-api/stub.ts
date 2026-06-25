import type {
  DiageoNamAPI,
  DiageoNamAPIClient,
  InboundSubmissionEndpoint,
  InboundSubmissionResponse,
  TokenEndpoint,
  TokenResponse,
} from './api'

import type { DeepPartial } from '@bobcats-coding/skid/core/type'
import { createStubRestClient, type StubEndpoint } from '@bobcats-coding/skid/rest/stub'

import { deepmerge } from 'deepmerge-ts'

const FAKE_ACCESS_TOKEN = 'fake-diageo-access-token'

const tokenResponse: TokenResponse = {
  access_token: FAKE_ACCESS_TOKEN,
  token_type: 'Bearer',
  expires_in: 3600,
}

const tokenEndpoint: StubEndpoint<TokenEndpoint> = {
  request: {
    method: 'POST',
    pathname: '/diageo/common/oauth2/provider/token',
    headers: {
      Client_ID: 'test-client-id',
      Client_Secret: 'test-client-secret',
      Grant_Type: 'client_credentials',
      'Content-Type': 'application/json',
    },
    body: { message: 'token request' },
  },
  response: tokenResponse,
}

const inboundResponse: InboundSubmissionResponse = {
  status: 'success',
  messageId: 'fake-diageo-message-id',
}

const inboundEndpoint: StubEndpoint<InboundSubmissionEndpoint> = {
  request: {
    method: 'POST',
    pathname: '/global/tdcdp/common/eapi/api/inbound/sfmc',
    headers: {
      Authorization: `Bearer ${FAKE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: {
      ContactKey: 'fake@example.com',
      EventDefinitionKey: 'APIEvent-af8c5e50-f91f-2f85-c057-d13d60054427',
      Data: {
        SubscriberKey: 'fake@example.com',
        EmailAddress: 'fake@example.com',
        FirstName: 'Test',
        LastName: 'User',
        DateOfBirth: '1990-01-01',
        PostCode: '10001',
        PhoneNumber: '',
        Emailable: true,
        Country: 'US',
        Province: '',
        PrivacyPolicyVersion: '14.0',
        Brand: 'Casamigos',
        BrandAbbreviation: 'CAS',
        EntrySource: 'US_CAS_TEST_FY26_Bars.com',
        TDGlobalID: '',
        TDSSCID: '',
        AdditionalField1: '',
        AdditionalValue1: '',
        AdditionalField2: '',
        AdditionalValue2: '',
        AdditionalField3: '',
        AdditionalValue3: '',
        AdditionalField4: '',
        AdditionalValue4: '',
        AdditionalField5: '',
        AdditionalValue5: '',
      },
    },
  },
  response: inboundResponse,
}

type StubAPIDefinition = [StubEndpoint<TokenEndpoint>, StubEndpoint<InboundSubmissionEndpoint>]

type CustomStubAPIDefinition = [
  DeepPartial<StubEndpoint<TokenEndpoint>>,
  DeepPartial<StubEndpoint<InboundSubmissionEndpoint>>,
]

const defaultEndpoints: StubAPIDefinition = [tokenEndpoint, inboundEndpoint]

export const diageoNamAPIClient: DiageoNamAPIClient = createStubRestClient<
  DiageoNamAPI,
  StubAPIDefinition
>(defaultEndpoints)

export const createDiageoNamStubAPIClient = (
  customEndpoints: CustomStubAPIDefinition,
): DiageoNamAPIClient => {
  return createStubRestClient<DiageoNamAPI, StubAPIDefinition>([
    deepmerge(defaultEndpoints[0], customEndpoints[0]),
    deepmerge(defaultEndpoints[1], customEndpoints[1]),
  ] as StubAPIDefinition)
}
