import { createSaveAnswersRequest, type GoogleFormsAPIClient } from './api'
import type { GoogleFormsService } from './types'

import { map } from 'rxjs/operators'

export const createGoogleFormsService = (
  googleFormsAPIClient: GoogleFormsAPIClient,
): GoogleFormsService => {
  return {
    saveAnswers: (formId, answers) => {
      return googleFormsAPIClient(
        createSaveAnswersRequest({
          formId,
          body: answers,
        }),
      ).pipe(map(() => undefined))
    },
  }
}
