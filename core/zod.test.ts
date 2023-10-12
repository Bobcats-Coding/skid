import { zodGuard } from './zod'

test('zodGuard returns a custom schema based on the guard type', () => {
  const schema = zodGuard((arg: unknown): arg is 1 => arg === 1)
  const one: 1 = schema.parse(1)
  expect(one).toBe(1)
})

test('zodGuard accepts custom error', () => {
  const schema = zodGuard((arg: unknown): arg is 1 => arg === 1, 'it is not 1')
  const result = schema.safeParse(2)
  if (!result.success) {
    expect(result.error.issues[0]?.message).toBe('it is not 1')
  }
})
