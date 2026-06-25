export type IdentityMatcher =
  | {
      type: 'regex'
      value: RegExp
    }
  | {
      type: 'percentage'
      value: number
    }

export type FeatureFlipperConfiguration = {
  name: string
  value: boolean
  identity?: Record<string, IdentityMatcher>
}
