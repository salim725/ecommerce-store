import express from 'express'
import { authenticate, authorize } from '../../../shared/middleware/auth.middleware.js'
import {
  cancelOrder,
  createOrder,
  getAllOrders,
  getAllOrdersToUser,
  getOrderById,
  updateOrderStatus,
} from '../controllers/order.controller.js'
import { validate } from '../../../shared/middleware/validate.middleware.js'
import { asyncHandler } from '../../../shared/middleware/asyncHandler.js'
import { createOrderSchema, updateOrderStatusSchema } from '../validation/order.schemas.js'
import { objectIdSchema } from '../../../shared/schemas/objectId.schema.js'

const orderRouter = express.Router()

orderRouter.post(
  '/',
  authenticate,
  authorize('customer'),
  validate(createOrderSchema),
  asyncHandler(createOrder),
)
orderRouter.get('/', authenticate, authorize('admin'), asyncHandler(getAllOrders))
orderRouter.get('/my-order', authenticate, authorize('customer'), asyncHandler(getAllOrdersToUser))
orderRouter.get(
  '/:id',
  authenticate,
  authorize('customer', 'admin'),
  validate(objectIdSchema, 'params'),
  asyncHandler(getOrderById),
)
orderRouter.put(
  '/:id/status',
  authenticate,
  authorize('admin'),
  validate(objectIdSchema, 'params'),
  validate(updateOrderStatusSchema),
  asyncHandler(updateOrderStatus),
)
orderRouter.put(
  '/:id/cancel',
  authenticate,
  authorize('customer'),
  validate(objectIdSchema, 'params'),
  asyncHandler(cancelOrder),
)

export default orderRouter
