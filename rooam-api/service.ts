import { type RooamAPIClient } from './api'
import type { RooamService } from './types'

export const createRoamService = (
  rooamAPIClient: RooamAPIClient,
): RooamService => {
  return {
    openCheck: () => {
      return rooamAPIClient(createRetrieveLocationRequest(baseParams)).pipe(
        map((_embedded) => _embedded),
      )
    }
  }
}