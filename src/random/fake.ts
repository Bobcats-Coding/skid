import type { RandomBackend } from './service'

export const createFakeRandomBackend = (): {
  backend: RandomBackend
  integerRequests: Array<[number, number]>
  stringRequests: number[]
} => {
  const integerRequests: Array<[number, number]> = []
  const stringRequests: number[] = []
  const backend: RandomBackend = {
    generateInteger(min, max) {
      integerRequests.push([min, max])
      return max
    },
    generateString(length) {
      // @TODO should use full alphanumeric
      const currentCharCode = 97 + stringRequests.length
      stringRequests.push(length)
      return Array.from({ length }).fill(String.fromCharCode(currentCharCode)).join('')
    },
  }

  return {
    integerRequests,
    stringRequests,
    backend,
  }
}
