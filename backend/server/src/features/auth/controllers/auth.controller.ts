import { Request, Response, NextFunction } from 'express'
import type { AuthPayload } from '../../../shared/types/auth.types.js'
import { toLoginUserDto } from '../../../shared/dtos/user.dto.js'
import { sendSuccess, sendError } from '../../../shared/utils/apiResponse.js'
import {
  setRefreshCookie,
  clearRefreshCookie,
  signRefreshToken,
} from '../../../shared/utils/jwt.js'
import {
  registerUser,
  verifyEmailByToken,
  loginUser,
  requestPasswordReset,
  resetPasswordByToken,
  startAdminLogin,
  verifyAdmin2FA,
  getUserById,
  refreshAccessTokenFromRefreshToken,
} from '../services/auth.service.js'

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body
    const result = await registerUser(name, email, password)

    if (!result.ok && result.reason === 'EMAIL_EXISTS') {
      res.status(409).json({ status: 409, message: 'Email already exists', data: null })
      return
    }

    if (!result.ok && result.reason === 'EMAIL_SEND_FAILED') {
      res.status(503).json({
        status: 503,
        message: 'Account created but verification email could not be sent. Please try again later.',
        data: null,
      })
      return
    }

    res.status(201).json({
      success: true,
      status: 201,
      message: 'Register successful. Please verify your email.',
      data: null,
    })
  } catch (error) {
    next(error)
  }
}

export const verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.params.token as string
    const result = await verifyEmailByToken(token)

    if (!result.ok && result.reason === 'INVALID_TOKEN') {
      res.status(400).json({ status: 400, message: 'Invalid or expired token', data: null })
      return
    }

    if (!result.ok && result.reason === 'ALREADY_VERIFIED') {
      res.status(400).json({ status: 400, message: 'Email already verified', data: null })
      return
    }

    res.status(200).json({ status: 200, message: 'Email verified successfully', data: null })
  } catch (error) {
    next(error)
  }
}

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body
    const result = await loginUser(email, password)

    if (!result.ok && result.reason === 'INVALID_CREDENTIALS') {
      res.status(401).json({ status: 401, message: 'Invalid credentials', data: null })
      return
    }

    if (!result.ok && result.reason === 'NOT_VERIFIED') {
      res.status(403).json({ status: 403, message: 'Please verify your email first', data: null })
      return
    }

    const refreshToken = signRefreshToken({
      userId: String(result.user.id),
      role: result.user.role,
    })
    setRefreshCookie(res, refreshToken)

    sendSuccess(res, 200, { token: result.token, user: result.user }, {
      message: 'Login successful',
    })
  } catch (error) {
    next(error)
  }
}

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body
    await requestPasswordReset(email)

    res.status(200).json({
      status: 200,
      message: 'If this email exists, a reset link has been sent',
      data: null,
    })
  } catch (error) {
    next(error)
  }
}

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.params.token as string
    const { password } = req.body
    const result = await resetPasswordByToken(token, password)

    if (!result.ok) {
      res.status(400).json({ status: 400, message: 'Invalid or expired token', data: null })
      return
    }

    res.status(200).json({ status: 200, message: 'Password reset successfully', data: null })
  } catch (error) {
    next(error)
  }
}

export const logInForAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body
    const result = await startAdminLogin(email, password)

    if (!result.ok && result.reason === 'NOT_ADMIN') {
      res.status(403).json({ status: 403, message: 'Admins only', data: null })
      return
    }

    if (!result.ok) {
      res.status(401).json({ status: 401, message: 'Invalid credentials', data: null })
      return
    }

    res.status(200).json({ status: 200, message: '2FA code sent to your email', data: null })
  } catch (error) {
    next(error)
  }
}

export const verify2FA = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, code } = req.body
    const result = await verifyAdmin2FA(email, code)

    if (!result.ok) {
      res.status(401).json({
        status: 401,
        message: 'Invalid credentials or expired 2FA code',
        data: null,
      })
      return
    }

    setRefreshCookie(
      res,
      signRefreshToken({ userId: result.userId, role: result.role }),
    )

    sendSuccess(res, 200, { token: result.token }, {
      message: 'Admin login successful',
    })
  } catch (error) {
    next(error)
  }
}

export const logout = (_req: Request, res: Response): void => {
  clearRefreshCookie(res)
  sendSuccess(res, 200, null, { message: 'Logout successfully' })
}

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken as string | undefined
    if (!refreshToken) {
      sendError(res, 401, 'Refresh token missing')
      return
    }

    const result = await refreshAccessTokenFromRefreshToken(refreshToken)
    if (!result.ok) {
      clearRefreshCookie(res)
      sendError(res, 401, 'Invalid or expired refresh token')
      return
    }

    sendSuccess(res, 200, { token: result.token }, { message: 'Token refreshed' })
  } catch (error) {
    next(error)
  }
}

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.user as AuthPayload
    const user = await getUserById(userId)

    if (!user) {
      res.status(404).json({ status: 404, message: 'User not found', data: null })
      return
    }

    res.status(200).json({
      status: 200,
      message: 'User fetched successfully',
      data: toLoginUserDto(user),
    })
  } catch (error) {
    next(error)
  }
}
