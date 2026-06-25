import type { CryptoBackend } from './types'

export const createFakeCryptoBackend = (): {
  backend: CryptoBackend
  encryptRequests: string[]
  compareRequests: Array<[string, string]>
} => {
  const encryptRequests: string[] = []
  const compareRequests: Array<[string, string]> = []
  const backend: CryptoBackend = {
    comparePassword(plainPassword, encryptedPassword) {
      compareRequests.push([plainPassword, encryptedPassword])
      return encryptedPassword === `${plainPassword}`
    },
    encryptPassword(plainPassword) {
      encryptRequests.push(plainPassword)
      return `${plainPassword}`
    },
  }

  return {
    encryptRequests,
    compareRequests,
    backend,
  }
}
