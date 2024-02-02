import type { RooamService } from './types'

import { of } from 'rxjs'

export const createFakeRooamService = (): RooamService => ({
  getCheckStatus: () =>
    of({
      status: 'submitted',
      timestamp: Date.now(),
      message: 'Ok',
    }),
  openCheck: () =>
    of({
      id: '12345',
      status: 'accepted',
      orderNumber: '12-345',
    }),
})
