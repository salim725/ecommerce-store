import mongoose, { Document, Schema, Types } from "mongoose";
import { PRODUCT_CATEGORIES, type ProductCategory } from "../../../shared/constants/product-categories.js";

export interface IRating {
  user: Types.ObjectId;
  rating: number;
  comment?: string;
}

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  images: string[];
  imagePublicIds: string[];
  stock: number;
  sold: number;
  isActive: boolean;
  rating: IRating[];
  averageRating: number;
}

const ratingSchema = new Schema<IRating>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // 🔥 Reference to User model
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);
const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: [...PRODUCT_CATEGORIES],
    },
    images: {
      type: [String],
      default: [],
    },
    imagePublicIds: {
      type: [String],
      default: [],
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: [ratingSchema],
      default: [],
    },
    averageRating: {
      type: Number,
      max: 5,
      default: 0,
    },
  },
  { timestamps: true },
);

productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ isActive: 1 });

export default mongoose.model<IProduct>("Product", productSchema);
