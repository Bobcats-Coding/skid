import type { RandomBackend } from './service'

import crypto from 'crypto'

export const createCryptoBackend = (): RandomBackend => {
  return {
    generateInteger(min, max) {
      return crypto.randomInt(min, Math.min(max + 1, Number.MAX_SAFE_INTEGER))
    },
    generateString(length) {
      const hex = crypto.randomBytes(Math.ceil(length / 2)).toString('hex')
      return hex.slice(0, length)
    },
  }
}
