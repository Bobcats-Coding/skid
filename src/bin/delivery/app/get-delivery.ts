import type { InternalServices } from '../internal-services/index.ts'
import { createYargsApp } from './yargs-app.ts'
import { type YargsApp } from './yargs-app.ts'

export type YargsDelivery = {
  yargsApp: YargsApp
}

export const getDelivery = ({
  internalServices,
}: {
  internalServices: InternalServices
}): YargsDelivery => ({
  yargsApp: createYargsApp(internalServices),
})
