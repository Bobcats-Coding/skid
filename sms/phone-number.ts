import { type typeKey } from '@bobcats-coding/skid/core/util'

import { z } from 'zod'

const phoneNumberRegex = /^\+[1-9]\d{1,14}$/

export const phoneNumber = z.string().regex(phoneNumberRegex)

export type PhoneNumber = z.infer<typeof phoneNumber> & { [typeKey]: 'PhoneNumber' }

export const isPhoneNumber = (value: unknown): value is PhoneNumber => {
  return phoneNumberRegex.test(String(value))
}
