import {
  type AuthSearchParams,
  createGetScenarioRequest,
  createListScenarioRequest,
  createScenarioActionRequest,
  SCENARIO_ACTIONS,
  type ScenarioApiClient,
} from './api'
import { type Scenario, type ScenarioActionResponse } from './types'

import type { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

type AuthParams = {
  accessToken: string
}

type ModelRequestParams = AuthParams & {
  scenarioId: number
}

export type ScenarioService = {
  getAllScenarios: (params: AuthParams & AuthSearchParams) => Observable<Scenario[]>
  getScenarioById: (params: ModelRequestParams) => Observable<Scenario | undefined>
  startScenario: (params: ModelRequestParams) => Observable<ScenarioActionResponse | undefined>
  stopScenario: (params: ModelRequestParams) => Observable<ScenarioActionResponse | undefined>
}

export const createScenarioService = (scenarioApiClient: ScenarioApiClient): ScenarioService => {
  const getAllScenarios = (params: AuthParams & AuthSearchParams): Observable<Scenario[]> => {
    return scenarioApiClient(createListScenarioRequest(params)).pipe(
      map(({ scenarios }) => scenarios ?? []),
    )
  }

  const getScenarioById = (params: ModelRequestParams): Observable<Scenario | undefined> => {
    return scenarioApiClient(createGetScenarioRequest(params)).pipe(map(({ scenario }) => scenario))
  }

  const startScenario = (
    params: ModelRequestParams,
  ): Observable<ScenarioActionResponse | undefined> => {
    return scenarioApiClient(
      createScenarioActionRequest({
        ...params,
        action: SCENARIO_ACTIONS.START,
      }),
    ).pipe(map(({ scenario }) => scenario))
  }

  const stopScenario = (
    params: ModelRequestParams,
  ): Observable<ScenarioActionResponse | undefined> => {
    return scenarioApiClient(
      createScenarioActionRequest({
        ...params,
        action: SCENARIO_ACTIONS.STOP,
      }),
    ).pipe(map(({ scenario }) => scenario))
  }

  return {
    getAllScenarios,
    getScenarioById,
    startScenario,
    stopScenario,
  }
}
