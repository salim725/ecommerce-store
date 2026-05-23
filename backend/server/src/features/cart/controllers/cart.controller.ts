import { Request, Response, NextFunction } from 'express'
import type { AuthPayload } from '../../../shared/types/auth.types.js'
import { sendSuccess, sendError } from '../../../shared/utils/apiResponse.js'
import {
  findUserCart,
  buildCartSummary,
  addItemToCart,
  updateCartItemQuantity as updateCartItemQuantityService,
  removeCartItem,
  clearUserCart,
  syncGuestCart,
} from '../services/cart.service.js'

const getAuth = (req: Request): AuthPayload => req.user as AuthPayload

export const getCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = getAuth(req)
    const user = await findUserCart(userId)

    if (!user) {
      sendError(res, 404, 'User not found')
      return
    }

    sendSuccess(res, 200, buildCartSummary(user), { message: 'Fetch Cart' })
  } catch (error) {
    next(error)
  }
}

export const addToCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = getAuth(req)
    const { productId, quantity } = req.body
    const result = await addItemToCart(userId, productId, quantity)

    if (!result.ok) {
      sendError(res, 404, 'User not found')
      return
    }

    sendSuccess(res, 200, result.cart, { message: 'Product added to cart' })
  } catch (error) {
    next(error)
  }
}

export const updateCartItemQuantity = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { userId } = getAuth(req)
    const { productId } = req.params
    const { quantity } = req.body
    const result = await updateCartItemQuantityService(userId, productId as string, quantity)

    if (!result.ok && result.reason === 'USER_NOT_FOUND') {
      sendError(res, 404, 'User not found')
      return
    }

    if (!result.ok) {
      sendError(res, 404, 'Product not found in cart')
      return
    }

    sendSuccess(res, 200, result.cart, { message: 'Cart item updated successfully' })
  } catch (error) {
    next(error)
  }
}

export const deleteItemFromCart = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { userId } = getAuth(req)
    const { productId } = req.params
    const result = await removeCartItem(userId, productId as string)

    if (!result.ok && result.reason === 'USER_NOT_FOUND') {
      sendError(res, 404, 'User not found')
      return
    }

    if (!result.ok) {
      sendError(res, 404, 'Product not found in cart')
      return
    }

    sendSuccess(res, 200, result.cart, { message: 'Product removed from cart' })
  } catch (error) {
    next(error)
  }
}

export const clearCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = getAuth(req)
    const result = await clearUserCart(userId)

    if (!result.ok) {
      sendError(res, 404, 'User not found')
      return
    }

    sendSuccess(res, 200, [], { message: 'Cart cleared successfully' })
  } catch (error) {
    next(error)
  }
}

export const syncCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = getAuth(req)
    const { items } = req.body
    const result = await syncGuestCart(userId, items)

    if (!result.ok) {
      sendError(res, 404, 'User not found')
      return
    }

    sendSuccess(res, 200, result.cart, { message: 'Cart synced successfully' })
  } catch (error) {
    next(error)
  }
}
