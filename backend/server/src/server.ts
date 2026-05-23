import './config/env.js'
import express, { Application, Request, Response } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import hpp from 'hpp'
import { mongoSanitizeMiddleware } from './shared/middleware/mongoSanitize.middleware.js'
import { connectDB } from './config/db.js'
import { validateEnv } from './config/validateEnv.js'
import { corsOptions } from './config/cors.js'
import { errorHandler } from './shared/middleware/error.handler.js'
import { apiLimiter, authLimiter } from './shared/middleware/rateLimiter.js'
import authRout from './features/auth/routes/auth.route.js'
import productRouter from './features/products/routes/product.route.js'
import orderRouter from './features/orders/routes/order.route.js'
import userRoute from './features/users/routes/user.route.js'
import cartRoute from './features/cart/routes/cart.route.js'
import adminRouter from './features/admin/routes/admin.route.js'
import categoriesRouter from './features/categories/routes/categories.route.js'
import { sendError } from './shared/utils/apiResponse.js'
import cookieParser from 'cookie-parser'

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason)
  process.exit(1)
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
  process.exit(1)
})

const app: Application = express()
const port = process.env.PORT || 3010

app.set('trust proxy', 1)

app.use(helmet())
app.use(cors(corsOptions))
app.use(hpp())

app.use(express.json())
app.use(cookieParser())
app.use(mongoSanitizeMiddleware())
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use('/api', apiLimiter)

app.use('/api/v1/auth', authLimiter, authRout)
app.use('/api/v1/products', productRouter)
app.use('/api/v1/orders', orderRouter)
app.use('/api/v1/users', userRoute)
app.use('/api/v1/cart', cartRoute)
app.use('/api/v1/admin', adminRouter)
app.use('/api/v1/categories', categoriesRouter)

app.use((_req: Request, res: Response) => {
  sendError(res, 404, 'Not found')
})

app.use(errorHandler)

try {
  validateEnv()
  await connectDB()
  app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
  })
} catch (err) {
  console.error('Server startup failed:', err)
  process.exit(1)
}
