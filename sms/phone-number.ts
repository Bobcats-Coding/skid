import { typeKey } from '@bobcats-coding/skid/core/util'

import { z } from 'zod'

const phoneNumber = z.string()

export type PhoneNumber = z.infer<typeof phoneNumber> & { [typeKey]: 'PhoneNumber' }

export const isPhoneNumber = (value: unknown): value is PhoneNumber => {
  return /^\+[1-9]\d{1,14}$/.test(String(value))
}
