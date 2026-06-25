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
  getProductsByGroup: () => of([]),
  getGroups: () => of([]),
  getProductByIdAndGroup: () =>
    of({
      id: 'product123',
      groupId: 'group123',
      name: 'fake-product',
      price: 1000,
      modifiers: [],
    }),
  getOrderPricePreview: () =>
    of({
      total: 150,
      taxAmount: 50,
      productPrice: 100,
      serviceCharge: 0,
    }),
})
