import { ObjectWithStringLiteralKey, StringLiteral } from './type'

export const makeObjectFromStringLiteral = <KEY, VALUE>(
  key: StringLiteral<KEY>,
  value: VALUE,
): ObjectWithStringLiteralKey<KEY, VALUE> => {
  // We have to cast the type because [key] is always considered as string
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return { [key]: value } as ObjectWithStringLiteralKey<KEY, VALUE>
}
