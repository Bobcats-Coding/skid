import { getExternalServices } from './external-services/get.ts'

import { createApplication } from '@skid-lib/core/application.ts'

import { baseApplication } from '../delivery/app/app.ts'

export const application = createApplication(
  {
    getExternalServices: [
      {
        patternPartial: { environment: 'prod' },
        value: () => getExternalServices(),
      },
    ],
  },
  () => baseApplication,
)
