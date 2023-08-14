export type LocationResponse = {
  _links: {
    auth?: Link
    clock_entries?: Link
    configuration?: Link
    discounts?: Link
    employees?: Link
    item_order_modes?: Link
    jobs?: Link
    menu?: Link
    order_types?: Link
    price_check?: Link
    reports?: Link
    revenue_centers?: Link
    self?: Link
    shifts?: Link
    tables?: Link
    tender_types?: Link
    terminals?: Link
    tickets?: Link
    transfers?: Link
    void_types?: Link
  }
  address?: Address
  agent_version: string | null
  concept_name: string | null
  created: number
  custom_id: null
  development: boolean
  display_name: string | null
  google_place_id: string | null
  health: Health
  id: string
  latitude?: null | any
  longitude?: null | any
  modified: number
  name: string | null
  owner: string | null
  phone: string | null
  pos_type: string | null
  status: string | null
  timezone: string | null
  updater_version: string | null
  website: string | null
}

export type Link = {
  href: string
  type: string
}

export type Address = {
  city: string | null
  country: string | null
  state: string | null
  street1: string | null
  street2?: string | null
  zip: string | null
}

export type Health = {
  agent: {
    average_cpu: number
    average_memory: number
    healthy: boolean
    processes: number
  }
  healthy: boolean
  system: {
    average_cpu: number
    average_memory: number
    healthy: boolean
  }
  tickets: {
    response_time: number
    status: string | null
  }
}

export type Employee = {
  _links: {
    clock_entries: Link
    open_tickets: Link
    pay_rates: Link
    self: Link
  }
  check_name: string
  first_name: string
  id: string
  last_name: string
  login: string
  middle_name?: null
  pos_id: string | null
  start_date: null | string
}

export type SingleTicketResponse = {
  _embedded: {
    discounts?: Discount[]
    employee: Employee
    items: []
    order_type: {
      _links: {
        self: Link
      }
      available: boolean
      id: string
      name: string
      pos_id: string
    }
    payments: any[] // todo
    revenue_center: {
      _links: {
        open_tickets: Link
        self: Link
        tables: Link
      }
      default: boolean
      id: string
      name: string
      pos_id: string
    }
    service_charges: [
      {
        _links: {
          self: Link
        }
        comment: string | null
        id: string
        included_tax: string | number // not listed in the docs so may as well be string or a number :,)
        name: string
        price: number
      },
    ]
    voided_items: any[]
  }
  _links: {
    discounts: Link
    employee: Link
    items: Link
    order_type: Link
    payments: Link
    revenue_center: Link
    self: Link
    service_charges: Link
    voided_items: Link
  }
  auto_send: boolean
  closed_at: null | number
  correlation: Correlation
  fire_date: null | number
  fire_time: null | number
  guest_count: number
  id: string
  name: string | null
  open: boolean
  opened_at: number
  pos_id: string
  ready_date: null | number
  ready_time: null | number
  ticket_number: number
  totals: Totals
  void: boolean
}

export type Correlation = {
  sequence: string
  source: string
}

export type Totals = {
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

export type GetAllTicketsResponse = {
  _embedded: {
    tickets: SingleTicketResponse[]
  }
  _links: {
    next: Link
    self: Link
  }
  count: number
  limit: number
}

export type OpenTicketRequest = {
  employee: string
  order_type: string
  revenue_center: string
  items: NewItemDetails[]
  payments: NewPaymentDetails[]
  discounts?: Discount[]
}

export type NewItemDetails = {
  menu_item: string
  quantity?: number
  auto_send?: boolean
  comment?: string
  name?: string
}

export type NewPaymentDetails = {
  amount?: number
  type: string
  tip: number
  token: string
  full?: boolean
}

export type Discount = {
  value?: number
  code?: string
  comment?: string
  discount: string
}

export type TicketDiscountsResponse = {
  _embedded: {
    discounts: [
      {
        _embedded: {
          discount: DiscountBody
        }
        _links: {
          discount: Link
          self: Link
        }
        comment: string | null
        id: string
        name: string
        value: number
      },
    ]
  }
  _links: {
    self: Link
  }
  count: number
}

export type DiscountBody = {
  _links: {
    self: Link
  }
  applies_to: {
    item: boolean
    ticket: boolean
  }
  available: boolean
  id: string
  max_amount?: number
  max_percent?: number
  min_amount?: number
  min_percent?: number
  min_ticket_total?: number
  name?: string
  open: false
  pos_id: string
  type: string
  value: number
}

export type DiscountResponse = {
  _embedded: {
    discount: DiscountBody
  }
  comment: string | null
  id: string
  name: string
  value: number
}

export type ApplyDiscountBody = {
  discount: string
  value?: number
  code?: string
  comment?: string
}

export type FireTicketObject = {
  ticket_item: string
  item_order_mode?: string
}

export type FireTicketBody = {
  items: FireTicketObject[]
}

export type TicketItemsResponse = {
  _embedded: {
    items: TicketItem[]
  }
  _links: {
    self: Link
  }
  count: number
}

export type TicketItem = {
  _embedded: {
    discounts: Discount[]
    menu_item?: {
      _embedded: {
        menu_categories?: [
          {
            _links: {
              self: Link
            }
            id: string
            level: number
            name: string
            pos_id: string
          },
        ]
        price_levels?: [
          {
            _links: {
              self: Link
            }
            barcodes?: any // sry, unsure what this is based on the docs
            id: string
            name: string
            price_per_unit: number
          },
        ]
      }
      _links: {
        menu_categories: Link
        option_sets: Link
        price_levels: Link
        self: Link
      }
      barcodes: any
      id: string
      in_stock: any
      name: string
      open: boolean
      open_name: any // again, docs don't say what this is
      pos_id: string
      price_per_unit: number
    }
    modifiers: [] // todo
  }
  _links: {
    discounts: Link
    menu_item: Link
    modifiers: Link
    self: Link
  }
  comment?: string | null
  id: string
  included_tax: any // could be either a strng or a number :,))
  name: string
  price: number
  quantity: number
  seat: any // idk what this is
  sent: boolean
  sent_at: any
  split: number
}

export type ItemsToAdd = {
  items: NewItemDetails[]
}

export type ItemModifiersResponse = {
  _embedded: {
    modifiers: Modifier[]
  }
  _links: {
    self: Link
  }
  count: number
}

export type Modifier = any // todo once we know what this is

export type TicketPaymentsResponse = {
  _embedded: {
    payments: TicketPayment[]
  }
  _links: {
    self: Link
  }
  count: number
}

export type ThirdPartyPaymentBody = {
  amount: number
  comment?: string
  auto_close?: boolean
  tender_type: string
  tip: number
  type: string
}

export type TicketPayment = {
  _embedded: {
    tender_type: {
      _links: {
        self: Link
      }
      allows_tips: boolean
      id: string
      name: string
      pos_id: string
    }
    ticket?: SingleTicketResponse
  }
  _links: {
    self: Link
    tender_type: Link
    ticket?: Link
  }
  amount: number
  change: number
  comment?: string
  full_name?: string
  gift_card_balance?: number
  id: string
  last4: number | null
  status?: string
  tip: number
  type: string
}
