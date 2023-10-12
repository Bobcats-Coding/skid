import { type GetGuarded, type Guard } from './type'

import { z, type ZodSchema } from 'zod'

export const zodGuard = <GUARD extends Guard>(
  guard: GUARD,
  message?: string,
): ZodSchema<GetGuarded<GUARD>> => {
  return z.custom<GetGuarded<GUARD>>(guard, message)
}
