import type {
  CreateTicketEndpoint,
  FireTicketEndpoint,
  ListAllTicketsEndpoint,
  OmnivoreAPI,
  OmnivoreAPIClient,
  RetrieveLocationEndpoint,
  RetrieveLocationResponse,
  RetrieveSingleTicketEndpoint,
} from './api'
import {
  FireTicketBody,
  GetAllTicketsResponse,
  Link,
  LocationResponse,
  OpenTicketRequest,
  SingleTicketResponse,
} from './types'

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

const FAKE_LINK: Link = {
  href: 'https://justafakelink.com/some-path',
  type: 'discounts',
}

export const FAKE_TICKET: SingleTicketResponse = {
  _embedded: {
    discounts: [],
    employee: {
      _links: {
        clock_entries: FAKE_LINK,
        open_tickets: FAKE_LINK,
        pay_rates: FAKE_LINK,
        self: FAKE_LINK,
      },
      check_name: 'check',
      first_name: 'John',
      id: '42069',
      last_name: 'Doe',
      login: 'asdasd',
      pos_id: null,
      start_date: null,
    },
    items: [],
    order_type: {
      _links: {
        self: FAKE_LINK,
      },
      available: true,
      id: 'id',
      name: 'name',
      pos_id: 'posId',
    },
    payments: [],
    revenue_center: {
      _links: {
        open_tickets: FAKE_LINK,
        self: FAKE_LINK,
        tables: FAKE_LINK,
      },
      default: false,
      id: '42069',
      name: 'name',
      pos_id: 'posId',
    },
    service_charges: [
      {
        _links: {
          self: FAKE_LINK,
        },
        comment: 'no charges',
        id: 'abc123',
        included_tax: null,
        name: 'no charges',
        price: 0,
      },
    ],
    voided_items: [],
  },
  _links: {
    discounts: FAKE_LINK,
    employee: FAKE_LINK,
    items: FAKE_LINK,
    order_type: FAKE_LINK,
    payments: FAKE_LINK,
    revenue_center: FAKE_LINK,
    self: FAKE_LINK,
    service_charges: FAKE_LINK,
    voided_items: FAKE_LINK,
  },
  auto_send: false,
  closed_at: null,
  correlation: {
    sequence: '1',
    source: '1',
  },
  fire_date: null,
  fire_time: null,
  guest_count: 1,
  id: '42069',
  name: 'drinking alone again',
  open: true,
  opened_at: 123456789,
  pos_id: '42069',
  ready_date: null,
  ready_time: null,
  ticket_number: 42069,
  totals: {
    discounts: 0,
    due: 0,
    exclusive_tax: null,
    inclusive_tax: null,
    items: 1,
    other_charges: 1,
    paid: 1,
    service_charges: 1,
    sub_total: 111,
    tax: 0,
    tips: 0,
    total: 111,
  },
  void: true,
}

export const FAKE_TICKETS: GetAllTicketsResponse = {
  _embedded: {
    tickets: [FAKE_TICKET],
  },
  _links: {
    next: FAKE_LINK,
    self: FAKE_LINK,
  },
  count: 1,
  limit: 2,
}

export const OPEN_TICKET_BODY: OpenTicketRequest = {
  employee: 'Joe',
  order_type: 'takeout',
  revenue_center: '001',
  items: [],
  payments: [],
  discounts: [],
}

export const FIRE_TICKET_BODY: FireTicketBody = {
  items: [
    {
      ticket_item: 'tequila sunrise',
      item_order_mode: 'online'
    }
  ]
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

const retrieveSingleTicketResponse: SingleTicketResponse = FAKE_TICKET

const retrieveSingleTicketEndpoint: StubEndpoint<RetrieveSingleTicketEndpoint> = {
  request: {
    method: 'GET',
    pathname: `https://api.omnivore.io/1.0/locations/loc123/tickets/ticket123`,
    headers: { 'Api-Key': 'fake-api-key' },
  },
  response: retrieveSingleTicketResponse,
}

const getAllTicketsResponse: GetAllTicketsResponse = FAKE_TICKETS

const getAllTicketsEndpoint: StubEndpoint<ListAllTicketsEndpoint> = {
  request: {
    method: 'GET',
    pathname: `https://api.omnivore.io/1.0/locations/loc123/tickets`,
    headers: { 'Api-Key': 'fake-api-key' },
  },
  response: getAllTicketsResponse,
}

const openTicketResponse: SingleTicketResponse = FAKE_TICKET

const openTicketEndpoint: StubEndpoint<CreateTicketEndpoint> = {
  request: {
    method: 'POST',
    pathname: `https://api.omnivore.io/1.0/locations/loc123/tickets`,
    headers: { 'Api-Key': 'fake-api-key' },
    body: OPEN_TICKET_BODY,
  },
  response: openTicketResponse,
}

const fireTicketResponse: SingleTicketResponse = FAKE_TICKET

const fireTicketEndpoint: StubEndpoint<FireTicketEndpoint> = {
  request: {
    method: 'POST',
    pathname: `https://api.omnivore.io/1.0/locations/loc123/tickets/ticket123/fire`,
    headers: { 'Api-Key': 'fake-api-key' },
    body: FIRE_TICKET_BODY,
  },
  response: fireTicketResponse,
}

const endpoints = [
  retrieveLocationEndpoint,
  retrieveSingleTicketEndpoint,
  getAllTicketsEndpoint,
  openTicketEndpoint,
  fireTicketEndpoint
] as const

export const omnivoreAPIClient: OmnivoreAPIClient = createStubRestClient<
  OmnivoreAPI,
  typeof endpoints
>(endpoints)
