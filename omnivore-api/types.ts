export type API_KEY = {
  Authorization: `Api-Key: ${string}`
}

export type Link = {
  href: string
  type: string
}

export type Links = {
  [key: string]: Link
}

export type Employee = {
  _links: Links
  check_name: string
  first_name: string
  id: string
  last_name: string
  login: string
  middle_name: null | string
  pos_id: null | string
  start_date: null | string
}

export type OrderType = {
  _links: Links
  available: boolean
  id: string
  name: string
  pos_id: string
}

export type RevenueCenter = {
  _links: Links
  default: boolean
  id: string
  name: string
  pos_id: string
}

export type ServiceCharge = {
  _links: Links
  comment: null | string
  id: string
  included_tax: null | number
  name: string
  price: number
}

export type TicketTotal = {
  discounts: number
  due: number
  exclusive_tax: null | number
  inclusive_tax: null | number
  items: number
  other_charges: number
  paid: number
  service_charges: number
  sub_total: number
  tax: number
  tips: number
  total: number
}

export type Ticket = {
  _embedded: {
    discounts: any[]
    employee: Employee
    items: any[]
    order_type: OrderType
    payments: any[]
    revenue_center: RevenueCenter
    service_charges: ServiceCharge[]
    voided_items: any[]
  }
  _links: Links
  auto_send: boolean
  closed_at: null | string
  correlation: null | any
  fire_date: null | any
  fire_time: null | any
  guest_count: number
  id: string
  name: null | string
  open: boolean
  opened_at: number
  pos_id: null | string
  ready_date: null | any
  ready_time: null | any
  ticket_number: number
  totals: TicketTotal
  void: boolean
}

export type EmbeddedTickets = {
  tickets: Ticket[]
}

export type TicketResponse = {
  _embedded: EmbeddedTickets
  _links: Links
  count: number
  limit: number
}

export type SingleTicketResponse = {
  _embedded: Ticket
}

export type RetrieveDiscountResponse = {
  _embedded: DiscountEmbedded
  _links: {
    discount: Link
    self: Link
  }
  comment: null | string
  id: string
  name: string
  value: number
}

export type DiscountEmbedded = {
  discount: {
    _links: {
      self: Link
    }
    applies_to: AppliesTo
    available: boolean
    id: string
    max_amount: null | number
    max_percent: null | number
    min_amount: null | number
    min_percent: null | number
    min_ticket_total: null | number
    name: string
    open: boolean
    pos_id: string
    type: string
    value: number
  }
}

export type AppliesTo = {
  item: boolean
  ticket: boolean
}

export type Item = {
  menu_item: string
  quantity?: number
  comment?: string
  discounts?: any[]
  price_per_unit?: number
  price_level?: string
  modifiers?: any[]
  auto_send?: boolean
}

export type TicketRequestBody = {
  employee: string
  order_type: string
  revenue_center: string
  items: Item[]
  payments: {
    type: string
    tip: number
    amount: number
  }[]
}

export type VoidTicketBody = {
  void: boolean
}

export type TicketDiscount = {
  discount: string
  code?: string
  comment?: string
  value?: number
}[]

type SelfLink = {
  href: string
  type: string
}

export type ApplyDiscountToTicketResponse = {
  _embedded: TicketDiscount
  _links: {
    discounts: SelfLink
    employee: SelfLink
    items: SelfLink
    order_type: SelfLink
    payments: SelfLink
    revenue_center: SelfLink
    self: SelfLink
    service_charges: SelfLink
    voided_items: SelfLink
  }
  auto_send: boolean
  closed_at: null
  correlation: null
  fire_date: null
  fire_time: null
  guest_count: number
  id: string
  name: null
  open: boolean
  opened_at: number
  pos_id: null
  ready_date: null
  ready_time: null
  ticket_number: number
  totals: {
    discounts: number
    due: number
    exclusive_tax: null
    inclusive_tax: null
    items: number
    other_charges: number
    paid: number
    service_charges: number
    sub_total: number
    tax: number
    tips: number
    total: number
  }
  void: boolean
}

export type FireTicketResponse = {
  // will fill this out once their docs site starts working again :,)
}

export type FireTicketRequest = {
  items: [
    {
      ticketItem: string
    },
  ]
}

type MenuItem = {
  href: string
  type: string
}

type Category = {
  _links: {
    self: MenuItem
  }
  id: string
  level: number
  name: string
  pos_id: string
}

type PriceLevel = {
  _links: {
    self: MenuItem
  }
  barcodes: null
  id: string
  name: string
  price_per_unit: number
}

type MenuItemDetails = {
  _links: {
    menu_categories: MenuItem
    option_sets: MenuItem
    price_levels: MenuItem
    self: MenuItem
  }
  barcodes: null
  id: string
  in_stock: null
  name: string
  open: boolean
  open_name: null
  pos_id: string
  price_per_unit: number
  _embedded: {
    menu_categories: Category[]
    price_levels: PriceLevel[]
  }
}

export type RetrieveItemResponse = {
  _links: {
    discounts: MenuItem
    menu_item: MenuItem
    modifiers: MenuItem
    self: MenuItem
  }
  _embedded: {
    discounts: any[]
    menu_item: MenuItemDetails
    modifiers: any[]
  }
  comment: string
  id: string
  included_tax: null
  name: string
  price: number
  quantity: number
  seat: null
  sent: boolean
  sent_at: null
  split: number
}

export type AddItemsBody = {
  items: Item[]
}

export type VoidItemBody = {
  void_type?: string
}

export type ItemDiscountsResponse = {
  _embedded: {
    discounts: any[]
  }
  _links: {
    self: Link
  }
  count: number
}

export type ItemModifiersResponse = {
  _embedded: {
    modifiers: any[]
  }
  _links: Links
  count: number
}
