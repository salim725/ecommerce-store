import type { User } from "@/src/features/auth/slices/authSlice";

type ApiUser = {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
};

export function mapUserFromApi(user: ApiUser): User {
  const id = user._id ?? user.id;
  if (!id) {
    throw new Error("User payload missing id");
  }
  return {
    _id: String(id),
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
  };
}
