import User from '../../users/model/user.model.js'
import Product from '../../products/model/product.model.js'
import type { ICartItem } from '../../users/model/user.model.js'

export async function findUserCart(userId: string) {
  return User.findById(userId).populate('cart.product', 'name price images stock')
}

export function buildCartSummary(user: NonNullable<Awaited<ReturnType<typeof findUserCart>>>) {
  let totalPrice = 0

  const items = user.cart.map((item) => {
    const product = item.product as unknown as { price: number }
    const subtotal = product.price * item.quantity
    totalPrice += subtotal

    return {
      product: item.product,
      quantity: item.quantity,
      subtotal,
    }
  })

  return { items, totalItems: items.length, totalPrice }
}

export type CartMutationResult =
  | { ok: true; cart: ICartItem[] }
  | { ok: false; reason: 'USER_NOT_FOUND' }

export async function addItemToCart(
  userId: string,
  productId: string,
  quantity: number,
): Promise<CartMutationResult> {
  const user = await User.findById(userId)

  if (!user) {
    return { ok: false, reason: 'USER_NOT_FOUND' }
  }

  const existingItem = user.cart.find((item) => item.product.toString() === productId)

  if (existingItem) {
    existingItem.quantity += quantity
  } else {
    user.cart.push({
      product: productId as unknown as ICartItem['product'],
      quantity: quantity || 1,
    })
  }

  await user.save()
  return { ok: true, cart: user.cart }
}

export async function updateCartItemQuantity(
  userId: string,
  productId: string,
  quantity: number,
): Promise<CartMutationResult | { ok: false; reason: 'ITEM_NOT_FOUND' }> {
  const user = await User.findById(userId)

  if (!user) {
    return { ok: false, reason: 'USER_NOT_FOUND' }
  }

  const cartItem = user.cart.find((item) => item.product.toString() === productId)

  if (!cartItem) {
    return { ok: false, reason: 'ITEM_NOT_FOUND' }
  }

  cartItem.quantity = quantity
  await user.save()

  return { ok: true, cart: user.cart }
}

export async function removeCartItem(
  userId: string,
  productId: string,
): Promise<CartMutationResult | { ok: false; reason: 'ITEM_NOT_FOUND' }> {
  const user = await User.findById(userId)

  if (!user) {
    return { ok: false, reason: 'USER_NOT_FOUND' }
  }

  const existingItem = user.cart.find((item) => item.product.toString() === productId)

  if (!existingItem) {
    return { ok: false, reason: 'ITEM_NOT_FOUND' }
  }

  user.cart = user.cart.filter((item) => item.product.toString() !== productId)
  await user.save()

  return { ok: true, cart: user.cart }
}

export async function clearUserCart(userId: string): Promise<CartMutationResult> {
  const user = await User.findById(userId)

  if (!user) {
    return { ok: false, reason: 'USER_NOT_FOUND' }
  }

  user.cart = []
  await user.save()

  return { ok: true, cart: [] }
}

export async function syncGuestCart(
  userId: string,
  items: { productId: string; quantity: number }[],
): Promise<CartMutationResult> {
  const user = await User.findById(userId)

  if (!user) {
    return { ok: false, reason: 'USER_NOT_FOUND' }
  }

  for (const item of items) {
    const product = await Product.findById(item.productId)
    if (!product) continue

    const existingItem = user.cart.find((p) => p.product.toString() === item.productId)

    if (existingItem) {
      existingItem.quantity += item.quantity
      if (existingItem.quantity > product.stock) {
        existingItem.quantity = product.stock
      }
    } else {
      const quantity = Math.min(item.quantity, product.stock)
      user.cart.push({
        product: item.productId as unknown as ICartItem['product'],
        quantity,
      })
    }
  }

  await user.save()
  return { ok: true, cart: user.cart }
}
