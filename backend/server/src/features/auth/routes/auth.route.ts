import express from 'express'
import {
  forgotPassword,
  login,
  register,
  verifyEmail,
  resetPassword,
  logInForAdmin,
  verify2FA,
  logout,
  refresh,
  getMe,
} from '../controllers/auth.controller.js'
import { validate } from '../../../shared/middleware/validate.middleware.js'
import { authenticate } from '../../../shared/middleware/auth.middleware.js'
import { asyncHandler } from '../../../shared/middleware/asyncHandler.js'
import { tokenEndpointLimiter } from '../../../shared/middleware/rateLimiter.js'
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verify2FaSchema,
  verifyEmailTokenSchema,
} from '../validation/auth.schema.js'
import { Router } from 'express'

const authRout: Router = express.Router()

authRout.post('/register', validate(registerSchema), asyncHandler(register))
authRout.post('/login', validate(loginSchema), asyncHandler(login))
authRout.get(
  '/verify-email/:token',
  tokenEndpointLimiter,
  validate(verifyEmailTokenSchema, 'params'),
  asyncHandler(verifyEmail),
)
authRout.post('/forgot-password', validate(forgotPasswordSchema), asyncHandler(forgotPassword))
authRout.post('/reset-password/:token', validate(resetPasswordSchema), asyncHandler(resetPassword))
authRout.post('/admin/login', validate(loginSchema), asyncHandler(logInForAdmin))
authRout.post('/admin/verify-2fa', validate(verify2FaSchema), asyncHandler(verify2FA))
authRout.post('/refresh', asyncHandler(refresh))
authRout.post('/logout', authenticate, asyncHandler(logout))
authRout.get('/me', authenticate, asyncHandler(getMe))

export default authRout
