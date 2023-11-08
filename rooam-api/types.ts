import type { Observable } from 'rxjs'

export type Check = {
  partnerId: string,
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
  status: 'accepted',
  requestId: string,
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
  openCheck: (check: Check) => Observable<OpenCheckResult>
  // getCheckStatus: (requestId: OpenCheckResult['requestId']) => Observable<CheckStatus>
}
