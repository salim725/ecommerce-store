import express from 'express'
import { authenticate, authorize } from '../../../shared/middleware/auth.middleware.js'
import {
  addToCart,
  clearCart,
  deleteItemFromCart,
  getCart,
  syncCart,
  updateCartItemQuantity,
} from '../controllers/cart.controller.js'
import { validate } from '../../../shared/middleware/validate.middleware.js'
import { asyncHandler } from '../../../shared/middleware/asyncHandler.js'
import {
  addToCartSchema,
  syncCartSchema,
  updateCartItemSchema,
} from '../validation/cart.schemas.js'
import { productIdParamSchema } from '../../../shared/schemas/objectId.schema.js'

const cartRoute = express.Router()

cartRoute.get('/', authenticate, authorize('customer'), asyncHandler(getCart))
cartRoute.post('/', authenticate, authorize('customer'), validate(addToCartSchema), asyncHandler(addToCart))
cartRoute.put(
  '/:productId',
  authenticate,
  authorize('customer'),
  validate(productIdParamSchema, 'params'),
  validate(updateCartItemSchema),
  asyncHandler(updateCartItemQuantity),
)
cartRoute.delete(
  '/:productId',
  authenticate,
  authorize('customer'),
  validate(productIdParamSchema, 'params'),
  asyncHandler(deleteItemFromCart),
)
cartRoute.delete('/', authenticate, authorize('customer'), asyncHandler(clearCart))
cartRoute.post('/sync', authenticate, authorize('customer'), validate(syncCartSchema), asyncHandler(syncCart))

export default cartRoute
