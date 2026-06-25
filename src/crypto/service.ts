import type { CryptoServiceCreator } from './types'

export const createCryptoService: CryptoServiceCreator = (backend) => {
  return {
    encryptPassword: (plainPassword) => {
      try {
        return backend.encryptPassword(plainPassword)
      } catch (error) {
        throw new Error("Couldn't encrypt password", { cause: error })
      }
    },
    comparePassword: (plainPassword, encryptedPassword) => {
      try {
        return backend.comparePassword(plainPassword, encryptedPassword)
      } catch (error) {
        throw new Error("Couldn't compare passwords", { cause: error })
      }
    },
  }
}
