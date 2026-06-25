import { createHtmlRestClient } from '@bobcats-coding/skid/rest/html'
import type { RestEndpoint } from '@bobcats-coding/skid/rest/service'

export type SaveAnswersRequest = {
  method: 'POST'
  pathname: `/forms/d/e/${string}/formResponse`
  body: Record<string, unknown>
}

export type SaveAnswersEndpoint = RestEndpoint<SaveAnswersRequest, string>

export type GoogleFormsAPI = SaveAnswersEndpoint

export type GoogleFormsAPIClient = ReturnType<typeof createHtmlRestClient<GoogleFormsAPI>>

export const createGoogleFormsApiClient = (baseUrl: string): GoogleFormsAPIClient => {
  return createHtmlRestClient<GoogleFormsAPI>(baseUrl)
}

type SaveAnswersRequestParams = {
  formId: string
  body: SaveAnswersRequest['body']
}

export const createSaveAnswersRequest = ({
  formId,
  body,
}: SaveAnswersRequestParams): SaveAnswersRequest => {
  return {
    method: 'POST',
    pathname: `/forms/d/e/${formId}/formResponse`,
    body,
  }
}
