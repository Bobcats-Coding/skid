import type { Observable } from 'rxjs'

export type Check = {
  name?: string,
  guestCount?: number,
  items: Array<{
    productId: Product['id'],
    groupId: Product['groupId'],
    qty: number,
    modifiers?: Array<{
      id: string,
      groupId: string,
      qty: number,
    }>
  }>,
  discount?: number,
  payment?: {
    amount: number,
    tip: number,
  }
}

export type OpenCheckResult = {
  id: string,
  status: 'accepted',
}

export type CheckStatus = {
  status: 'submitted',
  message: string,
  timestamp: number,
}

export type Product = {
  id: string,
  groupId: string,
}

export type RooamBaseParams = {
  apiUrl: string,
  username: string,
  password: string,
}

export type RooamService = {
  openCheck: (partnerId: string, check: Check) => Observable<OpenCheckResult>
  getCheckStatus: (id: OpenCheckResult['id']) => Observable<CheckStatus>
}
