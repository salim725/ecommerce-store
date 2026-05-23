import bcrypt from 'bcrypt'
import User, { type IAddress, type IUser } from '../model/user.model.js'
import { toProfileDto } from '../../../shared/dtos/user.dto.js'

type AddressSubdoc = IAddress & { deleteOne(): Promise<void> }

export async function findProfileById(userId: string) {
  return User.findById(userId).select('-password').lean()
}

export type UpdateProfileResult =
  | { ok: true; user: ReturnType<typeof toProfileDto> }
  | { ok: false; reason: 'NOT_FOUND' }
  | { ok: false; reason: 'EMAIL_IN_USE' }

export async function updateProfile(
  userId: string,
  updates: { name?: string; email?: string },
): Promise<UpdateProfileResult> {
  const user = await User.findById(userId)

  if (!user) {
    return { ok: false, reason: 'NOT_FOUND' }
  }

  const { name, email } = updates

  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email })
    if (emailExists) {
      return { ok: false, reason: 'EMAIL_IN_USE' }
    }
  }

  if (name) user.name = name
  if (email) user.email = email

  await user.save()

  return { ok: true, user: toProfileDto(user) }
}

export type ChangePasswordResult =
  | { ok: true }
  | { ok: false; reason: 'NOT_FOUND' }
  | { ok: false; reason: 'WRONG_PASSWORD' }

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<ChangePasswordResult> {
  const user = await User.findById(userId).select('+password')

  if (!user) {
    return { ok: false, reason: 'NOT_FOUND' }
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password)
  if (!isMatch) {
    return { ok: false, reason: 'WRONG_PASSWORD' }
  }

  user.password = newPassword
  await user.save()

  return { ok: true }
}

export async function addAddress(
  userId: string,
  address: IAddress,
): Promise<{ ok: true; addresses: IAddress[] } | { ok: false; reason: 'NOT_FOUND' }> {
  const user = await User.findById(userId)

  if (!user) {
    return { ok: false, reason: 'NOT_FOUND' }
  }

  user.addresses.push(address)
  await user.save()

  return { ok: true, addresses: user.addresses }
}

export async function updateAddress(
  userId: string,
  addrId: string,
  updates: Partial<IAddress>,
): Promise<
  | { ok: true; address: IAddress }
  | { ok: false; reason: 'USER_NOT_FOUND' }
  | { ok: false; reason: 'ADDRESS_NOT_FOUND' }
> {
  const user = await User.findById(userId)

  if (!user) {
    return { ok: false, reason: 'USER_NOT_FOUND' }
  }

  const address = (user.addresses as unknown as { id(id: string): AddressSubdoc | null }).id(
    addrId,
  )

  if (!address) {
    return { ok: false, reason: 'ADDRESS_NOT_FOUND' }
  }

  const { street, city, zipCode, country } = updates
  if (street) address.street = street
  if (city) address.city = city
  if (zipCode) address.zipCode = zipCode
  if (country) address.country = country

  await user.save()

  return { ok: true, address }
}

export async function deleteAddress(
  userId: string,
  addrId: string,
): Promise<
  | { ok: true; addresses: IAddress[] }
  | { ok: false; reason: 'USER_NOT_FOUND' }
  | { ok: false; reason: 'ADDRESS_NOT_FOUND' }
> {
  const user = await User.findById(userId)

  if (!user) {
    return { ok: false, reason: 'USER_NOT_FOUND' }
  }

  const address = (user.addresses as unknown as { id(id: string): AddressSubdoc | null }).id(
    addrId,
  )

  if (!address) {
    return { ok: false, reason: 'ADDRESS_NOT_FOUND' }
  }

  await address.deleteOne()
  await user.save()

  return { ok: true, addresses: user.addresses }
}

export async function listUsersForAdmin() {
  return User.find().select('name email role isVerified createdAt').lean()
}

export type UpdateRoleResult =
  | { ok: true; data: { id: unknown; role: IUser['role'] } }
  | { ok: false; reason: 'SELF_CHANGE' }
  | { ok: false; reason: 'NOT_FOUND' }

export async function updateUserRole(
  targetId: string,
  adminId: string,
  role: IUser['role'],
): Promise<UpdateRoleResult> {
  if (adminId === targetId) {
    return { ok: false, reason: 'SELF_CHANGE' }
  }

  const user = await User.findById(targetId)

  if (!user) {
    return { ok: false, reason: 'NOT_FOUND' }
  }

  user.role = role
  await user.save()

  return { ok: true, data: { id: user._id, role: user.role } }
}

export type DeleteUserResult = { ok: true } | { ok: false; reason: 'NOT_FOUND' }

export async function deleteUserById(id: string): Promise<DeleteUserResult> {
  const user = await User.findById(id)

  if (!user) {
    return { ok: false, reason: 'NOT_FOUND' }
  }

  await user.deleteOne()
  return { ok: true }
}
