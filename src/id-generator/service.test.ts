import { createFakeIdGeneratorBackend } from './fake'
import { createIdGeneratorService } from './service'

import { describe, expect, it } from 'vitest'

describe('Id Generator Service', () => {
  it('should use the provided backend', () => {
    const { uuidRequests, backend } = createFakeIdGeneratorBackend()
    const idGenerator = createIdGeneratorService(backend)
    idGenerator.generateUuid()
    expect(uuidRequests).toEqual(['fake-uuid-1'])
  })

  it('should return distinct values on repeated calls', () => {
    const { uuidRequests, backend } = createFakeIdGeneratorBackend()
    const idGenerator = createIdGeneratorService(backend)
    const first = idGenerator.generateUuid()
    const second = idGenerator.generateUuid()
    expect(first).not.toEqual(second)
    expect(uuidRequests).toEqual(['fake-uuid-1', 'fake-uuid-2'])
  })
})
