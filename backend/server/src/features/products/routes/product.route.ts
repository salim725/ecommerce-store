import express, { Router } from 'express'
import {
  addProductReview,
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  getProductReviews,
  getProductsByCatgory,
  updateProduct,
} from '../controllers/products.controller.js'
import { authenticate, authorize } from '../../../shared/middleware/auth.middleware.js'
import { validate } from '../../../shared/middleware/validate.middleware.js'
import { asyncHandler } from '../../../shared/middleware/asyncHandler.js'
import {
  createProductSchema,
  ratingSchema,
  updateProductSchema,
} from '../validation/product.schema.js'
import { objectIdSchema } from '../../../shared/schemas/objectId.schema.js'
import { upload } from '../../../shared/middleware/upload.middleware.js'
import { uploadToCloudinary } from '../../../shared/middleware/uploadToCloudinary.middleware.js'

const productRouter: Router = express.Router()

productRouter.get('/', asyncHandler(getAllProducts))
productRouter.get('/category/:cat', asyncHandler(getProductsByCatgory))
productRouter.get('/:id/reviews', validate(objectIdSchema, 'params'), asyncHandler(getProductReviews))

productRouter.get('/:id', validate(objectIdSchema, 'params'), asyncHandler(getProductById))

productRouter.post(
  '/',
  authenticate,
  authorize('admin'),
  validate(createProductSchema),
  upload.array('images', 5),
  uploadToCloudinary,
  asyncHandler(createProduct),
)

productRouter.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(objectIdSchema, 'params'),
  validate(updateProductSchema),
  upload.array('images', 5),
  uploadToCloudinary,
  asyncHandler(updateProduct),
)

productRouter.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(objectIdSchema, 'params'),
  asyncHandler(deleteProduct),
)

productRouter.post(
  '/:id/rating',
  authenticate,
  authorize('customer'),
  validate(objectIdSchema, 'params'),
  validate(ratingSchema),
  asyncHandler(addProductReview),
)

export default productRouter
