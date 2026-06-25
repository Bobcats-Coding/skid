import type { FeatureFlipperConfiguration } from './type'

const hash2number = (str: string): number => {
  return Math.abs(
    str.split('').reduce((hash, char) => {
      const charCode = char.charCodeAt(0)
      return (hash << 5) - hash + charCode
    }, 0),
  )
}

const isIdentityInPercentage = (identityValue: string, percentage: number): boolean => {
  const hash = hash2number(identityValue) % 100
  return hash < percentage
}

export const getIdentityValue = (
  feature: FeatureFlipperConfiguration,
  identity: Partial<Record<string, string>>,
): boolean | undefined => {
  if (feature.identity === undefined) {
    return undefined
  }

  return !Object.entries(feature.identity).some(([identityKey, matcher]) => {
    const identityValue = identity[identityKey]

    if (identityValue === undefined) {
      return false
    }

    const resolvers = {
      regex: (value: RegExp) => !value.test(identityValue),
      percentage: (value: number) => !isIdentityInPercentage(identityValue, value),
    }

    return resolvers[matcher.type](matcher.value as RegExp & number)
  })
}
