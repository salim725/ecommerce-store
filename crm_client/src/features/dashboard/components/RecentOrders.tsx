import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { formatPrice } from "@/src/shared/utils/formatPrice";
import { formatDate } from "@/src/shared/utils/formatDate";

interface Order {
  _id: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

interface RecentOrdersProps {
  orders: Order[];
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-700">
          Recent Orders
        </CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-gray-500">No recent orders yet.</p>
            <Link
              href="/orders"
              className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              View all orders
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="text-sm text-gray-700">
                    {order.customerName}
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">
                    {formatPrice(order.total)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-700 capitalize">
                    {order.status}
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">
                    {formatDate(order.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
