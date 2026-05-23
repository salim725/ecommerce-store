import express, { Router } from 'express'
import { authenticate, authorize } from '../../../shared/middleware/auth.middleware.js'
import {
  addAddress,
  changePassword,
  deleteAddress,
  deleteUser,
  getAllUsers,
  getProfile,
  updateAddress,
  updateProfile,
  updateUserRole,
} from '../controllers/user.controller.js'
import { validate } from '../../../shared/middleware/validate.middleware.js'
import { asyncHandler } from '../../../shared/middleware/asyncHandler.js'
import {
  addAddressSchema,
  changePasswordSchema,
  updateProfileSchema,
  updateRoleSchema,
} from '../validation/user.schema.js'
import { objectIdSchema, addrIdParamSchema } from '../../../shared/schemas/objectId.schema.js'

const userRoute: Router = express.Router()

userRoute.get('/profile', authenticate, authorize('customer'), asyncHandler(getProfile))
userRoute.put(
  '/profile',
  authenticate,
  authorize('customer'),
  validate(updateProfileSchema),
  asyncHandler(updateProfile),
)
userRoute.put(
  '/change-password',
  authenticate,
  authorize('customer'),
  validate(changePasswordSchema),
  asyncHandler(changePassword),
)
userRoute.post(
  '/addresses',
  authenticate,
  authorize('customer'),
  validate(addAddressSchema),
  asyncHandler(addAddress),
)
userRoute.put(
  '/addresses/:addrId',
  authenticate,
  authorize('customer'),
  validate(addrIdParamSchema, 'params'),
  validate(addAddressSchema),
  asyncHandler(updateAddress),
)
userRoute.delete(
  '/addresses/:addrId',
  authenticate,
  authorize('customer'),
  validate(addrIdParamSchema, 'params'),
  asyncHandler(deleteAddress),
)

userRoute.get('/', authenticate, authorize('admin'), asyncHandler(getAllUsers))
userRoute.put(
  '/:id/role',
  authenticate,
  authorize('admin'),
  validate(objectIdSchema, 'params'),
  validate(updateRoleSchema),
  asyncHandler(updateUserRole),
)
userRoute.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(objectIdSchema, 'params'),
  asyncHandler(deleteUser),
)

export default userRoute
