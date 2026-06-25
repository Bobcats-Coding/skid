import { type ExternalServices } from '../external-services/index.ts'
import { getExternalServicesFake as getExternalServices } from '../external-services/fake.ts'
import { getInternalServices, type InternalServices } from '../internal-services/get.ts'
import { getDelivery, type YargsDelivery } from './get-delivery.ts'
import { main } from './main.ts'

import { createApplication } from '@skid-lib/core/application.ts'

export type ApplicationConfig = {
  externalServices: ExternalServices
  internalServices: InternalServices
  delivery: YargsDelivery
  identity: {
    environment: 'prod' | 'test'
  }
}

export const baseApplication = createApplication<ApplicationConfig>({
  getExternalServices,
  getInternalServices,
  getDelivery,
  main,
})
