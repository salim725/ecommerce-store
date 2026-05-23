import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt.js'

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 401,
        message: 'No token provided',
        data: null,
      })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyAccessToken(token)

    req.user = decoded

    next()
  } catch {
    return res.status(401).json({
      status: 401,
      message: 'Invalid or expired token',
      data: null,
    })
  }
}

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user

    if (!user || typeof user === 'string' || !roles.includes(user.role as string)) {
      return res.status(403).json({
        status: 403,
        message: 'No permission',
        data: null,
      })
    }
    next()
  }
}
