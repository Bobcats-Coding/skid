import { AUTH_HEADER } from '../rest/type'
import { HOST } from './config'
import { Scenario, ScenarioActionResponse } from './types'

import { createJsonRestClient } from '@bobcats-coding/skid/rest/json'
import type { RestEndpoint } from '@bobcats-coding/skid/rest/service'

const SCENARIO_BASE_PATHNAME = 'api/v2/scenarios' as const

export enum SCENARIO_ACTIONS {
  START = 'start',
  STOP = 'stop',
}

export type AuthSearchParams = { teamId?: string } | { organizationId: string }

export type ScenarioApiListRequest = {
  method: 'GET'
  pathname: typeof SCENARIO_BASE_PATHNAME
  search: AuthSearchParams
  headers: AUTH_HEADER
}

export type ScenarioApiListResponse = {
  scenarios: Scenario[]
}

export type ScenarioApiListEndpoint = RestEndpoint<ScenarioApiListRequest, ScenarioApiListResponse>

export type ScenarioApiSingleRequest = {
  method: 'GET'
  pathname: `${typeof SCENARIO_BASE_PATHNAME}/${number}`
  headers: AUTH_HEADER
}

export type ScenarioApiSingleResponse = {
  scenario: Scenario
}

export type ScenarioApiSingleEndpoint = RestEndpoint<
  ScenarioApiSingleRequest,
  ScenarioApiSingleResponse
>

export type ScenarioApiActionRequest = {
  method: 'POST'
  pathname: `${typeof SCENARIO_BASE_PATHNAME}/${number}/${SCENARIO_ACTIONS}`
  headers: AUTH_HEADER
}

export type ScenarioApiActionResponse = {
  scenario: ScenarioActionResponse
}

export type ScenarioApiActionEndpoint = RestEndpoint<
  ScenarioApiActionRequest,
  ScenarioApiActionResponse
>

export type ScenarioApi =
  | ScenarioApiListEndpoint
  | ScenarioApiSingleEndpoint
  | ScenarioApiActionEndpoint

export const scenarioApiClient = createJsonRestClient<ScenarioApi>('https', HOST)

export type ScenarioApiClient = typeof scenarioApiClient

export const createListScenarioRequest = ({
  accessToken,
  organizationId,
  teamId,
}: {
  accessToken: string
  organizationId?: string
  teamId?: string
}): ScenarioApiListRequest => {
  const search: AuthSearchParams =
    organizationId !== undefined ? { organizationId } : teamId !== undefined ? { teamId } : {}

  return {
    method: 'GET',
    pathname: SCENARIO_BASE_PATHNAME,
    search,
    headers: {
      Authorization: `Token ${accessToken}`,
    },
  }
}

export const createGetScenarioRequest = ({
  scenarioId,
  accessToken,
}: {
  scenarioId: number
  accessToken: string
}): ScenarioApiSingleRequest => ({
  method: 'GET',
  pathname: `${SCENARIO_BASE_PATHNAME}/${scenarioId}`,
  headers: {
    Authorization: `Token ${accessToken}`,
  },
})

export const createScenarioActionRequest = ({
  action,
  scenarioId,
  accessToken,
}: {
  action: SCENARIO_ACTIONS
  scenarioId: number
  accessToken: string
}): ScenarioApiActionRequest => ({
  method: 'POST',
  pathname: `${SCENARIO_BASE_PATHNAME}/${scenarioId}/${action}`,
  headers: {
    Authorization: `Token ${accessToken}`,
  },
})
