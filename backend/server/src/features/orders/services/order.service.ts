import type { UserEmailRecipient } from '../../../shared/types/user-email.types.js'
import { emailTransporter } from '../../../shared/email/transporter.js'
import { IOrder, IOrderItem } from '../model/order.model.js'

export const sendOrderConfirmationEmail = async (
  user: UserEmailRecipient | null,
  order: IOrder,
): Promise<void> => {
  if (!user) return

  const itemsList = order.items
    .map((item: IOrderItem) => `<li>${item.name} x${item.quantity} - ${item.price * item.quantity}</li>`)
    .join('')

  await emailTransporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: `Order Confirmation #${order._id}`,
    html: `
            <h2>Thank you ${user.name}!</h2>
            <p>Your order has been received.</p>
            <ul>${itemsList}</ul>
            <p><strong>Total: ${order.totalPrice}</strong></p>
            <p>Shipping to: ${order.shippingAddress.street}, ${order.shippingAddress.city}</p>
        `,
  })
}

export const sendOrderStatusUpdateEmail = async (
  user: UserEmailRecipient,
  order: IOrder,
): Promise<void> => {
  await emailTransporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: `Order Update #${order._id}`,
    html: `
            <h2>Hello ${user.name}</h2>
            <p>Your order status has been updated to:
               <strong>${order.orderStatus}</strong>
            </p>
        `,
  })
}
