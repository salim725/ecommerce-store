/**
 * Auth tokens are stateless JWTs (no refresh token or server-side denylist).
 * Logout is client-side only — document this if revocable sessions are required later.
 */
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import User from '../../users/model/user.model.js'
import { emailTransporter, emailTemplate } from '../../../shared/email/transporter.js'
import type { IUser } from '../../users/model/user.model.js'
import type { UserEmailRecipient } from '../../../shared/types/user-email.types.js'
import { signAccessToken, verifyRefreshToken } from '../../../shared/utils/jwt.js'
import { toLoginUserDto } from '../../../shared/dtos/user.dto.js'

function asEmailRecipient(user: IUser): UserEmailRecipient {
  return { name: user.name, email: user.email }
}

export async function sendVerificationEmail(user: IUser, token: string): Promise<void> {
  const { name, email } = asEmailRecipient(user)
  const verificationLink = `${process.env.CLIENT_URL}/verify-email/${token}`

  await emailTransporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verify your email ✅',
    html: emailTemplate(`
            <h2 style="color: #333;">Hello ${name} 👋</h2>
            <p style="color: #555;">Thank you for registering! Please verify your account:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationLink}" 
                   style="background-color: #4F46E5; color: white; padding: 12px 30px; 
                          text-decoration: none; border-radius: 5px; font-size: 16px;">
                    Verify Email
                </a>
            </div>
            <p style="color: #999; font-size: 13px;">This link expires in 24 hours.</p>
        `),
  })
}

export async function sendResetPasswordEmail(user: IUser, token: string): Promise<void> {
  const { name, email } = asEmailRecipient(user)
  const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`

  await emailTransporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Reset Your Password 🔐',
    html: emailTemplate(`
            <h2 style="color: #333;">Hello ${name}</h2>
            <p style="color: #555;">Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" 
                   style="background-color: #EF4444; color: white; padding: 12px 30px; 
                          text-decoration: none; border-radius: 5px; font-size: 16px;">
                    Reset Password
                </a>
            </div>
            <p style="color: #999; font-size: 13px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        `),
  })
}

export async function send2FAEmail(user: IUser, code: string): Promise<void> {
  const { name, email } = asEmailRecipient(user)

  await emailTransporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Your 2FA Code 🔑',
    html: emailTemplate(`
            <h2 style="color: #333;">Hello ${name}</h2>
            <p style="color: #555;">Your admin verification code is:</p>
            <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 36px; font-weight: bold; color: #4F46E5; 
                             letter-spacing: 8px; padding: 15px 30px; 
                             background: #F3F4F6; border-radius: 8px;">
                    ${code}
                </span>
            </div>
            <p style="color: #999; font-size: 13px;">This code expires in 10 minutes.</p>
        `),
  })
}

export type RegisterResult =
  | { ok: true }
  | { ok: false; reason: 'EMAIL_EXISTS' }
  | { ok: false; reason: 'EMAIL_SEND_FAILED' }

export async function registerUser(
  name: string,
  email: string,
  password: string,
): Promise<RegisterResult> {
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return { ok: false, reason: 'EMAIL_EXISTS' }
  }

  const user = await User.create({
    name,
    email,
    password,
    isVerified: false,
  })

  const emailToken = crypto.randomBytes(32).toString('hex')
  user.verificationToken = emailToken
  user.verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000
  await user.save()

  try {
    await sendVerificationEmail(user, emailToken)
  } catch (emailError) {
    console.error('Failed to send verification email:', emailError)
    return { ok: false, reason: 'EMAIL_SEND_FAILED' }
  }

  return { ok: true }
}

export type VerifyEmailResult =
  | { ok: true }
  | { ok: false; reason: 'INVALID_TOKEN' }
  | { ok: false; reason: 'ALREADY_VERIFIED' }

export async function verifyEmailByToken(token: string): Promise<VerifyEmailResult> {
  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpiry: { $gt: Date.now() },
  })

  if (!user) {
    return { ok: false, reason: 'INVALID_TOKEN' }
  }

  if (user.isVerified) {
    return { ok: false, reason: 'ALREADY_VERIFIED' }
  }

  user.isVerified = true
  user.verificationToken = null
  user.verificationTokenExpiry = null
  await user.save()

  return { ok: true }
}

export type LoginResult =
  | { ok: true; token: string; user: ReturnType<typeof toLoginUserDto> }
  | { ok: false; reason: 'INVALID_CREDENTIALS' }
  | { ok: false; reason: 'NOT_VERIFIED' }

export async function loginUser(email: string, password: string): Promise<LoginResult> {
  const user = await User.findOne({ email }).select('+password')

  if (!user) {
    return { ok: false, reason: 'INVALID_CREDENTIALS' }
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return { ok: false, reason: 'INVALID_CREDENTIALS' }
  }

  if (!user.isVerified) {
    return { ok: false, reason: 'NOT_VERIFIED' }
  }

  const token = signAccessToken({ userId: String(user._id), role: user.role })

  return { ok: true, token, user: toLoginUserDto(user) }
}

export async function requestPasswordReset(email: string): Promise<void> {
  const user = await User.findOne({ email })
  if (!user) return

  const resetToken = crypto.randomBytes(32).toString('hex')
  user.resetPasswordToken = resetToken
  user.resetPasswordExpiry = Date.now() + 60 * 60 * 1000
  await user.save()

  await sendResetPasswordEmail(user, resetToken)
}

export type ResetPasswordResult =
  | { ok: true }
  | { ok: false; reason: 'INVALID_TOKEN' }

export async function resetPasswordByToken(
  token: string,
  password: string,
): Promise<ResetPasswordResult> {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpiry: { $gt: Date.now() },
  })

  if (!user) {
    return { ok: false, reason: 'INVALID_TOKEN' }
  }

  user.password = password
  user.resetPasswordToken = null
  user.resetPasswordExpiry = null
  await user.save()

  return { ok: true }
}

export type AdminLoginStep1Result =
  | { ok: true }
  | { ok: false; reason: 'INVALID_CREDENTIALS' }
  | { ok: false; reason: 'NOT_ADMIN' }

export async function startAdminLogin(email: string, password: string): Promise<AdminLoginStep1Result> {
  const user = await User.findOne({ email }).select('+password')

  if (!user) {
    return { ok: false, reason: 'INVALID_CREDENTIALS' }
  }

  if (user.role !== 'admin') {
    return { ok: false, reason: 'NOT_ADMIN' }
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return { ok: false, reason: 'INVALID_CREDENTIALS' }
  }

  const code = crypto.randomInt(100000, 1000000).toString()
  user.twoFactorCode = code
  user.twoFactorExpiry = new Date(Date.now() + 10 * 60 * 1000)
  await user.save()

  await send2FAEmail(user, code)

  return { ok: true }
}

export type Verify2FAResult =
  | { ok: true; token: string; userId: string; role: string }
  | { ok: false; reason: 'INVALID_CODE' }

export async function verifyAdmin2FA(email: string, code: string): Promise<Verify2FAResult> {
  const user = await User.findOne({ email }).select('+twoFactorCode +twoFactorExpiry')

  const codeValid =
    user &&
    user.twoFactorCode === code &&
    user.twoFactorExpiry &&
    user.twoFactorExpiry >= new Date()

  if (!codeValid) {
    return { ok: false, reason: 'INVALID_CODE' }
  }

  const token = signAccessToken({ userId: String(user._id), role: user.role }, '7d')

  user.twoFactorCode = null
  user.twoFactorExpiry = null
  await user.save()

  return { ok: true, token, userId: String(user._id), role: user.role }
}

export async function getUserById(userId: string) {
  return User.findById(userId)
}

export type RefreshResult =
  | { ok: true; token: string }
  | { ok: false; reason: 'INVALID_TOKEN' }

export async function refreshAccessTokenFromRefreshToken(
  refreshToken: string,
): Promise<RefreshResult> {
  try {
    const decoded = verifyRefreshToken(refreshToken) as { userId?: string; role?: string }
    if (!decoded.userId || !decoded.role) {
      return { ok: false, reason: 'INVALID_TOKEN' }
    }

    const user = await User.findById(decoded.userId)
    if (!user) {
      return { ok: false, reason: 'INVALID_TOKEN' }
    }

    const token = signAccessToken({ userId: String(user._id), role: user.role })
    return { ok: true, token }
  } catch {
    return { ok: false, reason: 'INVALID_TOKEN' }
  }
}
