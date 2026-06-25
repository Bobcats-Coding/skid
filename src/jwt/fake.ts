import { deepEqual } from '../core/util'
import { type JWTPayload, type JwtService } from './service'

export const createFakeJwtService = <PAYLOAD extends JWTPayload>(
  invalid: PAYLOAD[] = [],
): JwtService<PAYLOAD> => {
  const verifyToken: JwtService<PAYLOAD>['verifyToken'] = async (token) => {
    const payload = JSON.parse(token)
    const isInvalid = invalid.some((invalid) => deepEqual(invalid, payload))
    if (isInvalid) {
      throw new Error('Could not parse JWT token.')
    }
    return { payload }
  }
  const createToken: JwtService<PAYLOAD>['createToken'] = async (payload) => {
    return JSON.stringify(payload)
  }

  const decodeToken: JwtService<PAYLOAD>['decodeToken'] = (token) => {
    const payload = JSON.parse(token)
    return { payload }
  }
  return { verifyToken, createToken, decodeToken }
}
