"use client";



import { useCallback, useEffect, useMemo, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/src/store/hook";

import { fetchProducts, removeProduct, setSelected } from "../slices/productsSlice";

import { Product } from "../services/productsApi";

import DataTable, { Column } from "@/src/shared/components/DataTable";

import ConfirmModal from "@/src/shared/components/ConfirmModal";

import ProductForm from "./ProductsForm";

import { Button } from "@/src/components/ui/button";

import { Badge } from "@/src/components/ui/badge";

import {

  Select,

  SelectContent,

  SelectItem,

  SelectTrigger,

  SelectValue,

} from "@/src/components/ui/select";

import { PlusCircle } from "lucide-react";
import RowActionsMenu from "@/src/shared/components/RowActionsMenu";

import { toast } from "react-toastify";

import { formatPrice } from "@/src/shared/utils/formatPrice";

import ContentPanel from "@/src/shared/components/ContentPanel";

import ListPageToolbar from "@/src/shared/components/ListPageToolbar";

import ListPagination from "@/src/shared/components/ListPagination";

import { paginateSlice } from "@/src/shared/utils/clientList";



function stockBadgeVariant(stock: number): "default" | "secondary" | "destructive" {

  if (stock > 10) return "default";

  if (stock > 0) return "secondary";

  return "destructive";

}



export default function ProductsList() {

  const dispatch = useAppDispatch();

  const { items, isLoading } = useAppSelector((state) => state.products);



  const [isFormOpen, setIsFormOpen] = useState(false);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [categoryFilter, setCategoryFilter] = useState("all");

  const [page, setPage] = useState(1);



  const categories = useMemo(() => {
    const fromItems = new Set(items.map((p) => p.category).filter(Boolean));
    return Array.from(fromItems).sort();
  }, [items]);



  const handleSearchChange = useCallback((query: string) => {

    setSearchQuery(query);

    setPage(1);

  }, []);



  useEffect(() => {

    const load = async () => {

      try {

        await dispatch(fetchProducts()).unwrap();

      } catch {

        toast.error("Failed to load products");

      }

    };

    load();

  }, [dispatch]);



  const filteredItems = useMemo(() => {

    let result = items;

    if (categoryFilter !== "all") {

      result = result.filter((p) => p.category === categoryFilter);

    }

    if (searchQuery) {

      const q = searchQuery.toLowerCase();

      result = result.filter(

        (p) =>

          p.name.toLowerCase().includes(q) ||

          p.category.toLowerCase().includes(q),

      );

    }

    return result;

  }, [items, searchQuery, categoryFilter]);



  const paginatedItems = useMemo(

    () => paginateSlice(filteredItems, page),

    [filteredItems, page],

  );



  const handleEdit = (product: Product) => {

    dispatch(setSelected(product));

    setIsFormOpen(true);

  };



  const handleCreate = () => {

    dispatch(setSelected(null));

    setIsFormOpen(true);

  };



  const handleDeleteClick = (id: string) => {

    setDeletingId(id);

    setIsConfirmOpen(true);

  };



  const handleDeleteConfirm = async () => {

    if (!deletingId) return;

    try {

      await dispatch(removeProduct(deletingId)).unwrap();

      toast.success("Product deleted successfully");

    } catch {

      toast.error("Failed to delete product");

    } finally {

      setIsConfirmOpen(false);

      setDeletingId(null);

    }

  };



  const columns: Column<Product>[] = [

    { key: "name", label: "Name" },

    { key: "category", label: "Category" },

    {

      key: "price",

      label: "Price",

      render: (row) => (

        <span className="font-medium text-gray-900">

          {formatPrice(row.price)}

        </span>

      ),

    },

    {

      key: "stock",

      label: "Stock",

      render: (row) => (

        <Badge variant={stockBadgeVariant(row.stock)}>

          {row.stock} units

        </Badge>

      ),

    },

    {

      key: "actions",

      label: "Actions",

      render: (row) => (
        <RowActionsMenu
          itemName={row.name}
          onEdit={() => handleEdit(row)}
          onDelete={() => handleDeleteClick(row._id)}
        />
      ),

    },

  ];



  const categoryFilterSlot = (

    <Select

      value={categoryFilter}

      onValueChange={(value) => {

        setCategoryFilter(value);

        setPage(1);

      }}

    >

      <SelectTrigger className="min-w-[11rem] w-auto" aria-label="Filter by category">

        <SelectValue placeholder="Category" />

      </SelectTrigger>

      <SelectContent
        position="popper"
        className="z-[100] bg-white text-gray-900 border border-gray-200 shadow-lg"
      >

        <SelectItem value="all">All categories</SelectItem>

        {categories.map((cat) => (

          <SelectItem key={cat} value={cat}>

            {cat}

          </SelectItem>

        ))}

      </SelectContent>

    </Select>

  );



  return (

    <div className="space-y-4">

      <ContentPanel className="space-y-4">

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-2xl font-bold text-gray-900">Products</h1>

            <p className="text-sm text-gray-500">Manage your store products</p>

          </div>

          <Button onClick={handleCreate} className="gap-2">

            <PlusCircle aria-hidden />

            Add Product

          </Button>

        </div>



        <ListPageToolbar

          onSearchChange={handleSearchChange}

          searchPlaceholder="Search by name or category…"

          categoryFilter={categoryFilterSlot}

        />



        <DataTable<Product>

          columns={columns}

          data={paginatedItems}

          isLoading={isLoading}

          emptyMessage="No products found."

          getRowId={(row) => row._id}

        />



        <ListPagination

          page={page}

          totalItems={filteredItems.length}

          onPageChange={setPage}

        />

      </ContentPanel>



      <ProductForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />



      <ConfirmModal

        isOpen={isConfirmOpen}

        onClose={() => setIsConfirmOpen(false)}

        onConfirm={handleDeleteConfirm}

        title="Delete Product"

        description="Are you sure you want to delete this product? This action cannot be undone."

      />

    </div>

  );

}

