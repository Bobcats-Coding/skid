export type CryptoService = {
  encryptPassword: (plainPassword: string) => string
  comparePassword: (plainPassword: string, encryptedPassword: string) => boolean
}

export type CryptoBackend = {
  encryptPassword: (plainPassword: string) => string
  comparePassword: (plainPassword: string, encryptedPassword: string) => boolean
}

export type CryptoServiceCreator = (backend: CryptoBackend) => CryptoService
