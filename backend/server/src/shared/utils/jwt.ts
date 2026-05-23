import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken'
import type { Response } from 'express'

const JWT_ALGORITHM = 'HS256' as const
const REFRESH_COOKIE = 'refreshToken'

export interface TokenPayload {
  userId: string
  role: string
}

export function signAccessToken(
  payload: TokenPayload,
  expiresIn: SignOptions['expiresIn'] = (process.env.JWT_ACCESS_EXPIRE ??
    '15m') as SignOptions['expiresIn'],
): string {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn,
    algorithm: JWT_ALGORITHM,
  })
}

export function signRefreshToken(payload: TokenPayload): string {
  const secret = process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET
  const expiresIn = (process.env.JWT_REFRESH_EXPIRE ?? '7d') as SignOptions['expiresIn']
  return jwt.sign({ userId: payload.userId, role: payload.role }, secret, {
    expiresIn,
    algorithm: JWT_ALGORITHM,
  })
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: [JWT_ALGORITHM],
  }) as JwtPayload
}

export function verifyRefreshToken(token: string): JwtPayload {
  const secret = process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET
  return jwt.verify(token, secret, {
    algorithms: [JWT_ALGORITHM],
  }) as JwtPayload
}

export function setRefreshCookie(res: Response, refreshToken: string): void {
  const maxAgeMs = 7 * 24 * 60 * 60 * 1000
  res.cookie(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: maxAgeMs,
    path: '/api/v1/auth',
  })
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' })
}

export { REFRESH_COOKIE }
