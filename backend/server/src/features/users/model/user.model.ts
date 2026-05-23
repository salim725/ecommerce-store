import mongoose, { Document, Schema, Types } from "mongoose";
import bcrypt from "bcrypt";

export interface IAddress {
  street: string;
  city: string;
  zipCode: string;
  country: string;
}
export interface ICartItem {
  product: Types.ObjectId;
  quantity: number;
}
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "customer" | "admin";
  isVerified: boolean;
  verificationToken: string | null;
  verificationTokenExpiry: Date | null | number;
  resetPasswordToken: string | null;
  resetPasswordExpiry: Date | null | number;
  twoFactorCode: string | null;
  twoFactorExpiry: Date | null | number;
  addresses: IAddress[];
  cart: ICartItem[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}
const addressSchema = new Schema<IAddress>(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: true },
);

const cartItemSchema = new Schema<ICartItem>({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, required: true, min: 1 },
});

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: {
      type: String,
      default: null,
    },

    verificationTokenExpiry: {
      type: Date,
      default: null,
    },

    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpiry: {
      type: Date,
      default: null,
    },

    twoFactorCode: {
      type: String,
      default: null,
    },

    twoFactorExpiry: {
      type: Date,
      default: null,
    },

    addresses: {
      type: [addressSchema],
      default: [],
    },

    cart: {
      type: [cartItemSchema],
      default: [],
    },
  },
  { timestamps: true },
);

// 🔐 Pre-save middleware להצפנת סיסמה
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// 🔐 השוואת סיסמה
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>("User", userSchema);
