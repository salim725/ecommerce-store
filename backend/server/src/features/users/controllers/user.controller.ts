import { Request, Response, NextFunction } from 'express'
import type { AuthPayload } from '../../../shared/types/auth.types.js'
import { toProfileDto } from '../../../shared/dtos/user.dto.js'
import type { IUser } from '../model/user.model.js'
import {
  findProfileById,
  updateProfile as updateProfileService,
  changePassword as changePasswordService,
  addAddress as addAddressService,
  updateAddress as updateAddressService,
  deleteAddress as deleteAddressService,
  listUsersForAdmin,
  updateUserRole as updateUserRoleService,
  deleteUserById,
} from '../services/users.service.js'

const getAuth = (req: Request): AuthPayload => req.user as AuthPayload

export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = getAuth(req)
    const userProfile = await findProfileById(userId)

    if (!userProfile) {
      res.status(404).json({ status: 404, message: 'profile not found', data: null })
      return
    }

    res.status(200).json({
      status: 200,
      message: 'profile found',
      data: toProfileDto(userProfile as IUser),
    })
  } catch (error) {
    next(error)
  }
}

export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = getAuth(req)
    const result = await updateProfileService(userId, req.body)

    if (!result.ok && result.reason === 'NOT_FOUND') {
      res.status(404).json({ status: 404, message: 'User not found', data: null })
      return
    }

    if (!result.ok && result.reason === 'EMAIL_IN_USE') {
      res.status(409).json({ status: 409, message: 'Email already in use', data: null })
      return
    }

    res.status(200).json({
      status: 200,
      message: 'Profile updated successfully',
      data: result.user,
    })
  } catch (error) {
    next(error)
  }
}

export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = getAuth(req)
    const { currentPassword, newPassword } = req.body
    const result = await changePasswordService(userId, currentPassword, newPassword)

    if (!result.ok && result.reason === 'NOT_FOUND') {
      res.status(404).json({ status: 404, message: 'User not found', data: null })
      return
    }

    if (!result.ok && result.reason === 'WRONG_PASSWORD') {
      res.status(400).json({ status: 400, message: 'Current password is incorrect', data: null })
      return
    }

    res.status(200).json({ status: 200, message: 'Password changed successfully', data: null })
  } catch (error) {
    next(error)
  }
}

export const addAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = getAuth(req)
    const result = await addAddressService(userId, req.body)

    if (!result.ok) {
      res.status(404).json({ status: 404, message: 'User not Found', data: null })
      return
    }

    res.status(201).json({ status: 201, message: 'Address added successfully', data: result.addresses })
  } catch (error) {
    next(error)
  }
}

export const updateAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const addrId = req.params.addrId as string
    const { userId } = getAuth(req)
    const result = await updateAddressService(userId, addrId, req.body)

    if (!result.ok && result.reason === 'USER_NOT_FOUND') {
      res.status(404).json({ status: 404, message: 'User not found', data: null })
      return
    }

    if (!result.ok) {
      res.status(404).json({ status: 404, message: 'Address not found', data: null })
      return
    }

    res.status(200).json({ status: 200, message: 'Address updated successfully', data: result.address })
  } catch (error) {
    next(error)
  }
}

export const deleteAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const addrId = req.params.addrId as string
    const { userId } = getAuth(req)
    const result = await deleteAddressService(userId, addrId)

    if (!result.ok && result.reason === 'USER_NOT_FOUND') {
      res.status(404).json({ status: 404, message: 'User not found', data: null })
      return
    }

    if (!result.ok) {
      res.status(404).json({ status: 404, message: 'Address not found', data: null })
      return
    }

    res.status(200).json({ status: 200, message: 'Address deleted successfully', data: result.addresses })
  } catch (error) {
    next(error)
  }
}

export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await listUsersForAdmin()
    res.status(200).json({ status: 200, message: 'Users fetched successfully', data: users })
  } catch (error) {
    next(error)
  }
}

export const updateUserRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string
    const { role } = req.body
    const { userId } = getAuth(req)
    const result = await updateUserRoleService(id, userId, role)

    if (!result.ok && result.reason === 'SELF_CHANGE') {
      res.status(400).json({ status: 400, message: 'Admin cannot change his own role', data: null })
      return
    }

    if (!result.ok) {
      res.status(404).json({ status: 404, message: 'User not found', data: null })
      return
    }

    res.status(200).json({
      status: 200,
      message: 'User role updated successfully',
      data: result.data,
    })
  } catch (error) {
    next(error)
  }
}

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string
    const result = await deleteUserById(id)

    if (!result.ok) {
      res.status(404).json({ status: 404, message: 'User not found', data: null })
      return
    }

    res.status(200).json({ status: 200, message: 'User deleted successfully', data: null })
  } catch (error) {
    next(error)
  }
}
