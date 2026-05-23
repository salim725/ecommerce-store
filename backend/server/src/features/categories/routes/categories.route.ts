import express, { Router } from 'express'
import { PRODUCT_CATEGORIES } from '../../../shared/constants/product-categories.js'
import { sendSuccess } from '../../../shared/utils/apiResponse.js'
import { asyncHandler } from '../../../shared/middleware/asyncHandler.js'

const categoriesRouter: Router = express.Router()

categoriesRouter.get(
  '/',
  asyncHandler((_req, res) => {
    sendSuccess(res, 200, PRODUCT_CATEGORIES, {
      message: 'Categories fetched successfully',
    })
  }),
)

export default categoriesRouter
