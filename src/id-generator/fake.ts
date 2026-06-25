import type { IdGeneratorBackend } from './service'

export const createFakeIdGeneratorBackend = (): {
  backend: IdGeneratorBackend
  uuidRequests: string[]
} => {
  const uuidRequests: string[] = []
  const backend: IdGeneratorBackend = {
    generateUuid: () => {
      const generated = `fake-uuid-${uuidRequests.length + 1}`
      uuidRequests.push(generated)
      return generated
    },
  }

  return {
    uuidRequests,
    backend,
  }
}
