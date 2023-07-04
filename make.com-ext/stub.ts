import {
    ScenarioApi,
    ScenarioApiClient,
    ScenarioApiListEndpoint,
    ScenarioApiListResponse,
    ScenarioApiSingleEndpoint,
    ScenarioApiSingleResponse,
    ScenarioApiActionEndpoint,
    ScenarioApiActionResponse,
} from './api';
import { Scenario } from './types';

import { createStubRestClient, StubEndpoint } from '@bobcats-coding/skid/rest/stub';

export const FAKE_SCENARIO: Scenario = {
    id: 1,
    name: 'Test Scenario',
    description: 'This is a test scenario',
    teamId: 1,
    scheduling: {
        type: 'interval',
        interval: 5000,
    },
    lastEdit: '2021-08-10T15:00:00.000Z',
    isinvalid: false,
    islinked: false,
    islocked: false,
    isPaused: false,
    iswaiting: false,
    usedPackages: [],
    nextExec: '2021-08-10T15:00:00.000Z',
    createdByUser: {
        id: 1,
        name: 'Test User',
        email: 'test@email.com',
    },
    updatedByUser: {
        id: 1,
        name: 'Test User',
        email: 'test@email.com',
    },
}

const scenarioApiSingleResponse: ScenarioApiSingleResponse = {
    scenario: FAKE_SCENARIO,
}

const scenarioApiListResponse: ScenarioApiListResponse = {
    scenarios: [FAKE_SCENARIO],
}

const scenarioApiStartActionResponse: ScenarioApiActionResponse = {
    scenario: { id: 1, islinked: true },
}

const scenarioApiStopActionResponse: ScenarioApiActionResponse = {
    scenario: { id: 1, islinked: false },
}

const scenarioApiListEndpoint: StubEndpoint<ScenarioApiListEndpoint> = {
    request: {
        method: 'GET',
        pathname: 'api/v2/scenarios',
        search: { organizationId: '1' },
        headers: {
            Authorization: 'Token 12345',
        },
    },
    response: scenarioApiListResponse,
}

const scenarioApiSingleEndpoint: StubEndpoint<ScenarioApiSingleEndpoint> = {
    request: {
        method: 'GET',
        pathname: 'api/v2/scenarios/1',
        headers: {
            Authorization: 'Token 12345',
        },
    },
    response: scenarioApiSingleResponse,
}

const scenarioApiStartActionEndpoint: StubEndpoint<ScenarioApiActionEndpoint> = {
    request: {
        method: 'POST',
        pathname: 'api/v2/scenarios/1/start',
        headers: {
            Authorization: 'Token 12345',
        },
    },
    response: scenarioApiStartActionResponse,
}

const scenarioApiStopActionEndpoint: StubEndpoint<ScenarioApiActionEndpoint> = {
    request: {
        method: 'POST',
        pathname: 'api/v2/scenarios/1/stop',
        headers: {
            Authorization: 'Token 12345',
        },
    },
    response: scenarioApiStopActionResponse,
}

const endpoints = [
    scenarioApiListEndpoint,
    scenarioApiSingleEndpoint,
    scenarioApiStartActionEndpoint,
    scenarioApiStopActionEndpoint,
] as const;

export const scenarioApiClient: ScenarioApiClient = createStubRestClient<
    ScenarioApi,
    typeof endpoints
>(endpoints);