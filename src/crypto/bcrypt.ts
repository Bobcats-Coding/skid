import type { CryptoBackend } from './types'

import bcrypt from 'bcryptjs'

export const createBCryptBackend = (): CryptoBackend => {
  return {
    encryptPassword: (plainPassword) => {
      const salt = bcrypt.genSaltSync(10)
      return bcrypt.hashSync(plainPassword, salt)
    },
    comparePassword: (plainPassword, encryptedPassword) => {
      return bcrypt.compareSync(plainPassword, encryptedPassword)
    },
  }
}
