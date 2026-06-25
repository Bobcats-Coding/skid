export type RandomGenerator = {
  generateString: (length?: number) => string
  generateInteger: (min?: number, max?: number) => number
}

export type RandomBackend = {
  generateString: (length: number) => string
  generateInteger: (min: number, max: number) => number
}

export const createRandomService = (randomBackend: RandomBackend): RandomGenerator => {
  return {
    generateString: (length = 16) => {
      if (length > 1024) {
        throw new Error('Random sting cannot be longer than 1024 characters')
      }
      try {
        return randomBackend.generateString(length)
      } catch (error) {
        throw new Error('Random string generation failed', { cause: error })
      }
    },
    generateInteger: (min = 0, max = Number.MAX_SAFE_INTEGER) => {
      try {
        return randomBackend.generateInteger(min, max)
      } catch (error) {
        throw new Error('Random integer generation failed', { cause: error })
      }
    },
  }
}
