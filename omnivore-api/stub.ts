import type {
  OmnivoreAPI,
  OmnivoreAPIClient,
  RetrieveLocationEndpoint,
  RetrieveLocationResponse,
} from './api'
import { LocationResponse } from './types'

import { createStubRestClient, StubEndpoint } from '@bobcats-coding/skid/rest/stub'

export const FAKE_LOCATION: LocationResponse = {
  _links: {
    discounts: {
      href: 'https://some-website.com/api/v2/locations/123456789/discounts/',
      type: 'discounts',
    },
  },
  address: {
    city: 'Beverly Hills',
    country: 'US',
    state: 'CA',
    street1: '1234 Rodeo Dr',
    zip: '90210',
  },
  agent_version: '01',
  concept_name: 'insert meaningful name here',
  created: 123456789,
  custom_id: null,
  development: true,
  display_name: 'insert meaningful name here',
  google_place_id: 'insert meaningful name here',
  health: {
    agent: {
      average_cpu: 0,
      average_memory: 0,
      healthy: true,
      processes: 0,
    },
    healthy: true,
    system: {
      average_cpu: 0,
      average_memory: 0,
      healthy: true,
    },
    tickets: {
      response_time: 0,
      status: null,
    },
  },
  id: '123456789',
  modified: 123456789,
  name: 'insert meaningful name here',
  owner: 'Definitely Not Me',
  phone: '1234567890',
  pos_type: 'POS-001',
  status: 'active',
  timezone: 'PDT',
  updater_version: '01',
  website: 'https://some-website.com',
}

const retrieveLocationResponse: RetrieveLocationResponse = FAKE_LOCATION

const retrieveLocationEndpoint: StubEndpoint<RetrieveLocationEndpoint> = {
  request: {
    method: 'GET',
    pathname: `https://api.omnivore.io/1.0/locations/loc123`,
    headers: { 'Api-Key': 'fake-api-key' },
  },
  response: retrieveLocationResponse,
}

const endpoints = [retrieveLocationEndpoint] as const

export const omnivoreAPIClient: OmnivoreAPIClient = createStubRestClient<
  OmnivoreAPI,
  typeof endpoints
>(endpoints)
