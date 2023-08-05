import { typeKey } from '@bobcats-coding/skid/core/util'

import { z } from 'zod'

const emailAddress = z.string().email()

export type EmailAddress = z.infer<typeof emailAddress> & { [typeKey]: 'EmailAddress' }

export const isEmailAddress = (value: unknown): value is EmailAddress => {
  return emailAddress.safeParse(value).success
}
