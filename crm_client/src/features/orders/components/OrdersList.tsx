"use client";



import { useCallback, useEffect, useMemo, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/src/store/hook";

import { fetchOrders, updateOrderStatus } from "../slices/ordersSlice";

import { Order, OrderStatus } from "../services/ordersApi";

import DataTable, { Column } from "@/src/shared/components/DataTable";

import ConfirmModal from "@/src/shared/components/ConfirmModal";

import { Badge } from "@/src/components/ui/badge";

import {

  Select,

  SelectContent,

  SelectItem,

  SelectTrigger,

  SelectValue,

} from "@/src/components/ui/select";

import { toast } from "react-toastify";

import { formatPrice } from "@/src/shared/utils/formatPrice";

import { formatDate } from "@/src/shared/utils/formatDate";

import ContentPanel from "@/src/shared/components/ContentPanel";

import ListPageToolbar from "@/src/shared/components/ListPageToolbar";

import ListPagination from "@/src/shared/components/ListPagination";

import { paginateSlice } from "@/src/shared/utils/clientList";



const statusOptions: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];



function orderStatusVariant(

  status: OrderStatus,

): "default" | "secondary" | "destructive" | "outline" {

  switch (status) {

    case "processing":

      return "default";

    case "shipped":

    case "delivered":

      return "secondary";

    case "cancelled":

      return "destructive";

    default:

      return "outline";

  }

}



export default function OrdersList() {

  const dispatch = useAppDispatch();

  const { items, isLoading } = useAppSelector((state) => state.orders);



  const [searchQuery, setSearchQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [page, setPage] = useState(1);

  const [cancelTarget, setCancelTarget] = useState<{

    id: string;

    customerName: string;

  } | null>(null);

  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  const [isUpdating, setIsUpdating] = useState(false);



  const handleSearchChange = useCallback((query: string) => {

    setSearchQuery(query);

    setPage(1);

  }, []);



  useEffect(() => {

    const load = async () => {

      try {

        await dispatch(fetchOrders()).unwrap();

      } catch {

        toast.error("Failed to load orders");

      }

    };

    load();

  }, [dispatch]);



  const filteredItems = useMemo(() => {

    let result = items;

    if (statusFilter !== "all") {

      result = result.filter((o) => o.status === statusFilter);

    }

    if (searchQuery) {

      const q = searchQuery.toLowerCase();

      result = result.filter(

        (o) =>

          o.customerName.toLowerCase().includes(q) ||

          o._id.toLowerCase().includes(q),

      );

    }

    return result;

  }, [items, searchQuery, statusFilter]);



  const paginatedItems = useMemo(

    () => paginateSlice(filteredItems, page),

    [filteredItems, page],

  );



  const applyStatusChange = async (id: string, status: OrderStatus) => {

    try {

      await dispatch(updateOrderStatus({ id, status })).unwrap();

      toast.success("Order status updated");

    } catch {

      toast.error("Failed to update order status");

    }

  };



  const handleStatusChange = (order: Order, newStatus: OrderStatus) => {

    if (newStatus === "cancelled" && order.status !== "cancelled") {

      setCancelTarget({ id: order._id, customerName: order.customerName });

      setIsCancelConfirmOpen(true);

      return;

    }

    applyStatusChange(order._id, newStatus);

  };



  const handleCancelConfirm = async () => {

    if (!cancelTarget) return;

    setIsUpdating(true);

    try {

      await applyStatusChange(cancelTarget.id, "cancelled");

    } finally {

      setIsUpdating(false);

      setIsCancelConfirmOpen(false);

      setCancelTarget(null);

    }

  };



  const columns: Column<Order>[] = [

    { key: "_id", label: "Order ID" },

    { key: "customerName", label: "Customer" },

    {

      key: "total",

      label: "Total",

      render: (row) => (

        <span className="font-medium text-gray-900">

          {formatPrice(row.total)}

        </span>

      ),

    },

    {

      key: "status",

      label: "Status",

      render: (row) => (

        <Badge variant={orderStatusVariant(row.status)} className="capitalize">

          {row.status}

        </Badge>

      ),

    },

    {

      key: "createdAt",

      label: "Date",

      render: (row) => (

        <span className="text-sm text-gray-600">

          {formatDate(row.createdAt)}

        </span>

      ),

    },

    {

      key: "actions",

      label: "Actions",

      render: (row) => (

        <Select

          value={row.status}

          onValueChange={(value) =>

            handleStatusChange(row, value as OrderStatus)

          }

        >

          <SelectTrigger

            size="sm"

            className="min-w-[8rem] w-auto capitalize"

            aria-label={`Change status for order ${row._id}`}

          >

            <SelectValue />

          </SelectTrigger>

          <SelectContent
            position="popper"
            className="z-[100] bg-white text-gray-900 border border-gray-200 shadow-lg"
          >

            {statusOptions.map((s) => (

              <SelectItem key={s} value={s} className="capitalize">

                {s}

              </SelectItem>

            ))}

          </SelectContent>

        </Select>

      ),

    },

  ];



  const statusFilterSlot = (

    <Select

      value={statusFilter}

      onValueChange={(value) => {

        setStatusFilter(value);

        setPage(1);

      }}

    >

      <SelectTrigger className="min-w-[11rem] w-auto" aria-label="Filter by status">

        <SelectValue placeholder="Status" />

      </SelectTrigger>

      <SelectContent
        position="popper"
        className="z-[100] bg-white text-gray-900 border border-gray-200 shadow-lg"
      >

        <SelectItem value="all">All statuses</SelectItem>

        {statusOptions.map((s) => (

          <SelectItem key={s} value={s} className="capitalize">

            {s}

          </SelectItem>

        ))}

      </SelectContent>

    </Select>

  );



  return (

    <div className="space-y-4">

      <ContentPanel className="space-y-4">

        <div>

          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>

          <p className="text-sm text-gray-500">Track and manage store orders</p>

        </div>



        <ListPageToolbar

          onSearchChange={handleSearchChange}

          searchPlaceholder="Search by customer or order ID…"

          statusFilter={statusFilterSlot}

        />



        <DataTable<Order>

          columns={columns}

          data={paginatedItems}

          isLoading={isLoading}

          emptyMessage="No orders found."

          getRowId={(row) => row._id}

        />



        <ListPagination

          page={page}

          totalItems={filteredItems.length}

          onPageChange={setPage}

        />

      </ContentPanel>



      <ConfirmModal

        isOpen={isCancelConfirmOpen}

        onClose={() => {

          if (!isUpdating) {

            setIsCancelConfirmOpen(false);

            setCancelTarget(null);

          }

        }}

        onConfirm={handleCancelConfirm}

        title="Cancel order"

        description={

          cancelTarget

            ? `Cancel order for ${cancelTarget.customerName}? This cannot be undone.`

            : "Cancel this order? This cannot be undone."

        }

        confirmLabel="Cancel order"

        isLoading={isUpdating}

      />

    </div>

  );

}

