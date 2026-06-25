import * as jose from 'jose'
import type { JWTPayload as JoseJWTPayload } from 'jose'

export type JWTPayload = JoseJWTPayload

export const createJwtService = <PAYLOAD extends JWTPayload>({
  secret,
}: {
  secret: string
}): JwtService<PAYLOAD> => {
  const encodedSecret = new TextEncoder().encode(secret)

  const verifyToken: JwtService<PAYLOAD>['verifyToken'] = async (
    token: string,
  ): Promise<{ payload: PAYLOAD }> => {
    try {
      const { payload } = await jose.jwtVerify<PAYLOAD>(token, encodedSecret)
      return { payload }
    } catch (error) {
      throw new Error('Could not parse JWT token.', { cause: error })
    }
  }

  const createToken: JwtService<PAYLOAD>['createToken'] = async (
    payload: PAYLOAD,
  ): Promise<string> => {
    const jwt = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(encodedSecret)

    return jwt
  }

  const decodeToken: JwtService<PAYLOAD>['decodeToken'] = (
    token: string,
  ): { payload: PAYLOAD | undefined } => {
    try {
      const payload = jose.decodeJwt<PAYLOAD>(token)
      return { payload }
    } catch (error) {
      console.warn('Could not parse JWT token.', error)
      return { payload: undefined }
    }
  }

  return { verifyToken, createToken, decodeToken }
}

export type JwtService<PAYLOAD extends JWTPayload> = {
  decodeToken: (token: string) => { payload: PAYLOAD | undefined }
  verifyToken: (token: string) => Promise<{ payload: PAYLOAD }>
  createToken: (payload: PAYLOAD) => Promise<string>
}
