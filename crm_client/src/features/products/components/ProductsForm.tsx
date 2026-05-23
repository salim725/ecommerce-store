"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import type { Product } from "../services/productsApi";
import {
  PRODUCT_CATEGORIES,
  type ProductCategory,
} from "../services/productsApi";
import {
  createProduct,
  updateProduct,
  setSelected,
} from "../slices/productsSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { toast } from "react-toastify";

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProductFormFieldsProps {
  selected: Product | null;
  onClose: () => void;
}

function ProductFormFields({ selected, onClose }: ProductFormFieldsProps) {
  const dispatch = useAppDispatch();
  const isEditing = !!selected;

  const [name, setName] = useState(selected?.name ?? "");
  const [description, setDescription] = useState(selected?.description ?? "");
  const [price, setPrice] = useState(selected?.price ?? 0);
  const [stock, setStock] = useState(selected?.stock ?? 0);
  const [category, setCategory] = useState<ProductCategory>(
    selected?.category ?? "electronics",
  );
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    dispatch(setSelected(null));
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 5);
    setImageFiles(files);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isEditing && imageFiles.length === 0) {
      toast.error("Add at least one product image");
      return;
    }

    const input = {
      name,
      description,
      price,
      stock,
      category,
      ...(imageFiles.length > 0 ? { imageFiles } : {}),
    };

    setIsLoading(true);

    try {
      if (isEditing) {
        await dispatch(updateProduct({ id: selected._id, input })).unwrap();
        toast.success("Product updated successfully");
      } else {
        await dispatch(createProduct(input)).unwrap();
        toast.success("Product created successfully");
      }
      handleClose();
    } catch {
      toast.error(
        isEditing ? "Failed to update product" : "Failed to create product",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-gray-900 text-xl font-bold">
          {isEditing ? "Edit Product" : "Add New Product"}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        <div>
          <Label htmlFor="name" className="text-gray-700 font-medium">
            Name
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Product name"
            required
            className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-gray-700 font-medium">
            Description
          </Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="At least 10 characters"
            required
            minLength={10}
            className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price" className="text-gray-700 font-medium">
              Price ($)
            </Label>
            <Input
              id="price"
              type="number"
              min={0}
              step={0.01}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              required
              className="bg-gray-50 border-gray-200 text-gray-900"
            />
          </div>
          <div>
            <Label htmlFor="stock" className="text-gray-700 font-medium">
              Stock
            </Label>
            <Input
              id="stock"
              type="number"
              min={0}
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              required
              className="bg-gray-50 border-gray-200 text-gray-900"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="category" className="text-gray-700 font-medium">
            Category
          </Label>
          <Select
            value={category}
            onValueChange={(value) => setCategory(value as ProductCategory)}
          >
            <SelectTrigger
              id="category"
              className="bg-gray-50 border-gray-200 text-gray-900"
            >
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-white text-gray-900 border border-gray-200">
              {PRODUCT_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat} className="capitalize">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="images" className="text-gray-700 font-medium">
            Images {isEditing ? "(optional, replaces existing)" : "(required)"}
          </Label>
          <Input
            id="images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="bg-gray-50 border-gray-200 text-gray-900"
          />
          {selected?.images?.[0] && imageFiles.length === 0 && (
            <p className="mt-1 text-xs text-gray-500">
              Current image on file; upload new files to replace.
            </p>
          )}
          {imageFiles.length > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              {imageFiles.length} file(s) selected (max 5)
            </p>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? "Saving..." : isEditing ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </>
  );
}

export default function ProductForm({ isOpen, onClose }: ProductFormProps) {
  const dispatch = useAppDispatch();
  const selected = useAppSelector((state) => state.products.selected);

  const handleClose = () => {
    dispatch(setSelected(null));
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-white border-0 shadow-2xl">
        <ProductFormFields
          key={selected?._id ?? "create"}
          selected={selected}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
