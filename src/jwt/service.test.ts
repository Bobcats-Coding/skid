import { createJwtService } from './service'

import { expect, test } from 'vitest'

test('jwtService', async () => {
  const jwtService = createJwtService<{ id: number }>({ secret: 'secret' })
  const token = await jwtService.createToken({ id: 1 })
  expect(token.length > 0).toBe(true)
  const { payload } = await jwtService.verifyToken(token)
  expect(payload.id).toBe(1)
})

test('jwtService with failed parsing', async () => {
  const jwtService = createJwtService<{ id: number }>({ secret: 'secret' })
  await expect(async () => await jwtService.verifyToken('invalid')).rejects.toThrowError(
    'Could not parse JWT token.',
  )
})
