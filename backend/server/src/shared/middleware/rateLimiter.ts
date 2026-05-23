import rateLimiter from 'express-rate-limit'

export const authLimiter = rateLimiter({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: 'Too many attempts, please try again after a minute',
        data: null
    }
})

export const tokenEndpointLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: 'Too many attempts on this endpoint, please try again later',
        data: null
    }
})

export const apiLimiter = rateLimiter({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: 'Too many requests, please try again after a minute',
        data: null
    }
})
