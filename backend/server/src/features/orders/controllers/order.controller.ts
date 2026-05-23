import mongoose from 'mongoose'
import Order from '../model/order.model.js'
import { IOrderItem } from '../model/order.model.js'
import Product from '../../products/model/product.model.js'
import User from '../../users/model/user.model.js'
import { Request, Response, NextFunction } from 'express'
import type { AuthPayload } from '../../../shared/types/auth.types.js'
import type { UserEmailRecipient } from '../../../shared/types/user-email.types.js'
import {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
} from '../services/order.service.js'
import { sendSuccess, sendError } from '../../../shared/utils/apiResponse.js'

const getAuth = (req: Request): AuthPayload => req.user as AuthPayload

function toEmailRecipient(user: { name: string; email: string }): UserEmailRecipient {
  return { name: user.name, email: user.email }
}

export const createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body
    const { userId } = getAuth(req)

    let totalPrice = 0
    const orderItems: IOrderItem[] = []
    const bulkOps: Parameters<typeof Product.bulkWrite>[0] = []

    const productIds = items.map((item: { productId: string }) => item.productId)
    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true,
    }).lean()

    const productMap = new Map(products.map((p) => [String(p._id), p]))

    for (const item of items) {
      const product = productMap.get(String(item.productId))

      if (!product) {
        sendError(res, 404, 'Product not found')
        return
      }

      if (product.stock < item.quantity) {
        sendError(res, 400, `Not enough stock for ${product.name}`)
        return
      }

      totalPrice += product.price * item.quantity

      orderItems.push({
        product: product._id as mongoose.Types.ObjectId,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images?.[0] || '',
      })

      bulkOps.push({
        updateOne: {
          filter: { _id: product._id },
          update: {
            $inc: {
              stock: -item.quantity,
              sold: item.quantity,
            },
          },
        },
      })
    }

    const session = await mongoose.startSession()
    let order

    try {
      session.startTransaction()

      const [createdOrder] = await Order.create(
        [
          {
            user: userId,
            items: orderItems,
            shippingAddress,
            totalPrice,
            paymentMethod,
            notes,
          },
        ],
        { session },
      )
      order = createdOrder

      await Product.bulkWrite(bulkOps, { session })
      await User.findByIdAndUpdate(userId, { cart: [] }, { session })

      await session.commitTransaction()
    } catch (txError) {
      await session.abortTransaction()
      throw txError
    } finally {
      await session.endSession()
    }

    const user = await User.findById(userId)
    if (user) {
      await sendOrderConfirmationEmail(toEmailRecipient(user), order)
    }

    sendSuccess(res, 201, order, { message: 'Order created successfully' })
  } catch (error) {
    console.error('ORDER ERROR:', error)
    next(error)
  }
}

export const getAllOrdersToUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { userId } = getAuth(req)

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name price images')
      .lean()

    res.status(200).json({
      status: 200,
      message: 'User orders fetched successfully',
      data: orders,
    })
  } catch (error) {
    next(error)
  }
}

export const getOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const { userId, role: userRole } = getAuth(req)

    const order = await Order.findById(id)
      .populate('items.product', 'name price images')
      .lean()

    if (!order) {
      res.status(404).json({ status: 404, message: 'Order not found', data: null })
      return
    }

    if (userRole !== 'admin' && order.user.toString() !== userId) {
      res.status(403).json({
        status: 403,
        message: 'Not authorized to view this order',
        data: null,
      })
      return
    }

    res.status(200).json({
      status: 200,
      message: 'Order found successfully',
      data: order,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit

    const total = await Order.countDocuments()

    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    res.status(200).json({
      status: 200,
      message: 'Orders fetched successfully',
      data: {
        orders,
        page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params
    const { orderStatus } = req.body

    const order = await Order.findById(id).populate('user', 'name email')

    if (!order) {
      res.status(404).json({ status: 404, message: 'Order not found', data: null })
      return
    }

    order.orderStatus = orderStatus
    await order.save()

    const populatedUser = order.user as unknown as { name: string; email: string }
    await sendOrderStatusUpdateEmail(toEmailRecipient(populatedUser), order)

    res.status(200).json({
      status: 200,
      message: 'Order status updated successfully',
      data: order,
    })
  } catch (error) {
    next(error)
  }
}

export const cancelOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const { userId } = getAuth(req)

    const order = await Order.findById(id)

    if (!order) {
      res.status(404).json({ status: 404, message: 'Order not found', data: null })
      return
    }

    if (order.user.toString() !== userId) {
      res.status(403).json({
        status: 403,
        message: 'Not authorized to cancel this order',
        data: null,
      })
      return
    }

    if (order.orderStatus !== 'pending') {
      res.status(400).json({
        status: 400,
        message: 'Only pending orders can be cancelled',
        data: null,
      })
      return
    }

    const restoreOps = order.items.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: {
          $inc: {
            stock: item.quantity,
            sold: -item.quantity,
          },
        },
      },
    }))

    if (restoreOps.length > 0) {
      await Product.bulkWrite(restoreOps)
    }

    order.orderStatus = 'cancelled'
    await order.save()

    res.status(200).json({
      status: 200,
      message: 'Order cancelled successfully',
      data: order,
    })
  } catch (error) {
    next(error)
  }
}
