export type IdGeneratorBackend = {
  generateUuid: () => string
}

export type IdGenerator = {
  generateUuid: () => string
}

export const createIdGeneratorService = (backend: IdGeneratorBackend): IdGenerator => ({
  generateUuid: () => backend.generateUuid(),
})
