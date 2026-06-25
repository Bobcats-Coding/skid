import { createGoogleFormsService } from './service'
import { googleFormsAPIClient } from './stub'
import type {} from './types'

import { coreMarbles } from '@bobcats-coding/skid/core/marbles-vitest'

import { describe, it } from 'vitest'

const googleFormsService = createGoogleFormsService(googleFormsAPIClient)

describe('GoogleFormsApiClient', () => {
  describe('saveAnswers', () => {
    it(
      'Should accepts answers',
      coreMarbles(({ expect }) => {
        const result$ = googleFormsService.saveAnswers('formId', {
          question1: 'answer1',
        })

        expect(result$).toBeObservable('-(n|)', {
          n: undefined,
        })
      }),
    )
  })
})
