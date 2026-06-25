import { createFakeCryptoBackend } from './fake'
import { createCryptoService } from './service'

import { describe, expect, it } from 'vitest'

describe('Crypto Service', () => {
  describe('Password encryption', () => {
    it('Should use the provided backend', () => {
      const { encryptRequests, backend } = createFakeCryptoBackend()
      const cryptoService = createCryptoService(backend)
      cryptoService.encryptPassword('password')
      expect(encryptRequests).toEqual(['password'])
    })
  })
  describe('Password comparison', () => {
    it('Should use the provided backend', () => {
      const { compareRequests, backend } = createFakeCryptoBackend()
      const cryptoService = createCryptoService(backend)
      const result = cryptoService.comparePassword('password', 'password')
      expect(compareRequests).toEqual([['password', 'password']])
      expect(result).toEqual(true)
    })

    it('Should return false if comparison failed', () => {
      const { compareRequests, backend } = createFakeCryptoBackend()
      const cryptoService = createCryptoService(backend)
      const result = cryptoService.comparePassword('password', 'password_wrong')
      expect(compareRequests).toEqual([['password', 'password_wrong']])
      expect(result).toEqual(false)
    })
  })
})
