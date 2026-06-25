import type { RooamAPIClient } from './api'

import type { Observable } from 'rxjs'

export type RequestConfig = {
  idempotencyKey: string
  partnerId: string
}

export type Check = {
  name?: string
  guestCount?: number
  items: Array<{
    productId: Product['id']
    groupId: Product['groupId']
    qty: number
    modifiers?: Array<{
      modifierId?: Modifier['modifierId']
      groupId?: Modifier['modifierGroupId']
      qty?: number
    }>
  }>
  discount?: number
  payment?: {
    amount: number
    tip: number
  }
  serviceCharge?: {
    amount: number
  }
}

export type OpenCheckResult = {
  id: string
  status: 'accepted'
  orderNumber: string | undefined
}

export type CheckStatus = {
  status: 'submitted' | 'pending'
  message: string
  timestamp: number
}

export type Product = {
  id: string
  groupId: string
  name: string
  price: number
  modifiers: Modifier[]
}

export type Modifier = {
  modifierGroupId: string
  modifierGroupName: string
  modifierId: string
  name: string
  price: number
}

export type GetProductsByGroupParams = {
  partnerId: string
  groupId?: Product['groupId']
}

export type GetProductByIdAndGroupParams = {
  partnerId: string
  groupId: Product['groupId']
  id: Product['id']
}

export type Group = {
  id: string
  name: string
}

export type GetGroupsParams = {
  partnerId: string
}

export type GetOrderPricePreviewParams = {
  idempotencyKey: string
  partnerId: string
  orderTypeId: string
  id: Product['id']
  groupId: Product['groupId']
  modifiers: Array<Pick<Modifier, 'modifierId' | 'modifierGroupId'>>
}

export type OrderPricePreview = {
  productPrice: number
  serviceCharge: number
  taxAmount: number
  total: number
}

export type RooamBaseParams = {
  username: string
  password: string
}

export type RooamServiceCreator = (
  rooamAPIClient: RooamAPIClient,
  baseParams: RooamBaseParams,
) => RooamService

export type RooamService = {
  openCheck: (config: RequestConfig, check: Check) => Observable<OpenCheckResult>
  getCheckStatus: (id: OpenCheckResult['id']) => Observable<CheckStatus>
  getProductsByGroup: (params: GetProductsByGroupParams) => Observable<Product[]>
  getGroups: (params: GetGroupsParams) => Observable<Group[]>
  getOrderPricePreview: (params: GetOrderPricePreviewParams) => Observable<OrderPricePreview>
  getProductByIdAndGroup: (params: GetProductByIdAndGroupParams) => Observable<Product>
}
