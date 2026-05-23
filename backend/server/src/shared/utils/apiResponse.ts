import type { Response } from 'express'

export type PaginationMeta = {
  page: number
  limit: number
  total: number
  pages: number
}

export type SuccessEnvelope<T> = {
  success: true
  status: number
  message: string
  data: T
  page?: number
  limit?: number
  total?: number
  totalPages?: number
  pagination?: PaginationMeta
}

export type ErrorEnvelope = {
  success: false
  status: number
  message: string
  data: null
  errors?: Record<string, string> | string[]
}

type SendSuccessOptions = {
  message?: string
  page?: number
  limit?: number
  total?: number
  totalPages?: number
}

/** Sends a success response with both legacy `status` fields and `success: true`. */
export function sendSuccess<T>(
  res: Response,
  statusCode: number,
  data: T,
  options: SendSuccessOptions = {},
): void {
  const message =
    options.message ??
    (statusCode === 201 ? 'Created' : statusCode === 200 ? 'OK' : 'OK')

  const body: SuccessEnvelope<T> = {
    success: true,
    status: statusCode,
    message,
    data,
  }

  if (options.page != null) body.page = options.page
  if (options.limit != null) body.limit = options.limit
  if (options.total != null) body.total = options.total
  if (options.totalPages != null) body.totalPages = options.totalPages

  if (options.page != null && options.limit != null && options.total != null) {
    body.pagination = {
      page: options.page,
      limit: options.limit,
      total: options.total,
      pages: options.totalPages ?? Math.ceil(options.total / options.limit),
    }
  }

  res.status(statusCode).json(body)
}

export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  errors?: Record<string, string> | string[],
): void {
  const body: ErrorEnvelope = {
    success: false,
    status: statusCode,
    message,
    data: null,
  }
  if (errors) body.errors = errors
  res.status(statusCode).json(body)
}
