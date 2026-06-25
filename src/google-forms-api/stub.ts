import type {
  GoogleFormsAPI,
  GoogleFormsAPIClient,
  SaveAnswersEndpoint,
  SaveAnswersRequest,
} from './api'

import { createStubRestClient, type StubEndpoint } from '@bobcats-coding/skid/rest/stub'

const SAVE_ANSWERS_BODY: SaveAnswersRequest['body'] = {
  question1: 'answer1',
}

const saveAnswersEndpoint: StubEndpoint<SaveAnswersEndpoint> = {
  request: {
    method: 'POST',
    pathname: '/forms/d/e/formId/formResponse',
    body: SAVE_ANSWERS_BODY,
  },
  response: '',
}

const endpoints = [saveAnswersEndpoint] as const

export const googleFormsAPIClient: GoogleFormsAPIClient = createStubRestClient<
  GoogleFormsAPI,
  typeof endpoints
>(endpoints)
