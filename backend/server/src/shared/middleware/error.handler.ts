import { Request, Response, NextFunction } from 'express'
import { sendError } from '../utils/apiResponse.js'

interface AppError extends Error {
  statusCode?: number
  status?: number
  code?: number
  keyValue?: Record<string, unknown>
  errors?: Record<string, { message: string }>
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.error(err)

  if (err.name === 'ValidationError' && err.errors) {
    const errors = Object.values(err.errors).map((e) => e.message)
    sendError(res, 400, 'Validation error', errors)
    return
  }

  if (err.name === 'CastError') {
    sendError(res, 404, 'Resource not found')
    return
  }

  if (err.code === 11000 && err.keyValue) {
    const field = Object.keys(err.keyValue)[0]
    sendError(res, 409, `${field} already exists`)
    return
  }

  if (err.name === 'JsonWebTokenError') {
    sendError(res, 401, 'Invalid token')
    return
  }

  if (err.name === 'TokenExpiredError') {
    sendError(res, 401, 'Token expired')
    return
  }

  const statusCode = err.statusCode ?? err.status ?? 500
  const message =
    process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'

  sendError(res, statusCode, message)
}
