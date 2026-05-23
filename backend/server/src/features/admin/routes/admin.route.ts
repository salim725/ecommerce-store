import express, { Router } from 'express'
import { authenticate, authorize } from '../../../shared/middleware/auth.middleware.js'
import { asyncHandler } from '../../../shared/middleware/asyncHandler.js'
import { getStats } from '../controllers/admin.controller.js'

const adminRouter: Router = express.Router()

adminRouter.get(
  '/stats',
  authenticate,
  authorize('admin'),
  asyncHandler(getStats),
)

export default adminRouter
