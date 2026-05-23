import User from '../../users/model/user.model.js'
import Product from '../../products/model/product.model.js'
import Order from '../../orders/model/order.model.js'

export interface AdminStats {
  totalUsers: number
  totalOrders: number
  totalProducts: number
  totalRevenue: number
  revenueByMonth: { month: string; amount: number }[]
}

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

function formatMonthLabel(year: number, monthIndex: number): string {
  return `${MONTH_LABELS[monthIndex]} ${year}`
}

export async function getAdminStats(): Promise<AdminStats> {
  const [totalUsers, totalOrders, totalProducts, revenueResult, monthlyRevenue] =
    await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments(),
      Order.aggregate<{ total: number }>([
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      Order.aggregate<{ _id: { year: number; month: number }; amount: number }>([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            amount: { $sum: '$totalPrice' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ])

  const totalRevenue = revenueResult[0]?.total ?? 0

  const revenueByMonth = monthlyRevenue.map((row) => ({
    month: formatMonthLabel(row._id.year, row._id.month - 1),
    amount: row.amount,
  }))

  return {
    totalUsers,
    totalOrders,
    totalProducts,
    totalRevenue,
    revenueByMonth,
  }
}
