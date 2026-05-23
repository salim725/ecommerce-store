import type { Request, Response, NextFunction, RequestHandler } from 'express'
import mongoSanitize from 'express-mongo-sanitize'

type SanitizeOptions = Parameters<typeof mongoSanitize.sanitize>[1]

/**
 * express-mongo-sanitize reassigns req.query; Express 5 exposes query as a
 * read-only getter, which throws. Sanitize in place and pin the result on req.
 */
export function mongoSanitizeMiddleware(
  options?: SanitizeOptions,
): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    for (const key of ['body', 'params', 'headers'] as const) {
      const value = req[key]
      if (value && typeof value === 'object') {
        req[key] = mongoSanitize.sanitize(
          value as Record<string, unknown>,
          options,
        ) as (typeof req)[typeof key]
      }
    }

    const query = req.query
    if (query && typeof query === 'object') {
      mongoSanitize.sanitize(query as Record<string, unknown>, options)
      Object.defineProperty(req, 'query', {
        value: query,
        writable: true,
        enumerable: true,
        configurable: true,
      })
    }

    next()
  }
}
