import type { IUser } from '../../features/users/model/user.model.js'

export function toPublicUserDto(user: IUser) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    addresses: user.addresses,
  }
}

export function toProfileDto(user: IUser) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    addresses: user.addresses,
  }
}

export function toLoginUserDto(user: IUser) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  }
}
