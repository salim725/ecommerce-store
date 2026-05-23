import axiosInstance from "@/src/shared/services/axiosInstance";
import { unwrap } from "@/src/shared/services/apiResponse";

export type UserRole = "customer" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  createdAt?: string;
  [key: string]: unknown;
}

export interface UpdateRolePayload {
  role: UserRole;
}

export const getUsers = async (): Promise<User[]> => {
  const response = await axiosInstance.get("users");
  return unwrap(response);
};

export const putUserRole = async (
  id: string,
  payload: UpdateRolePayload,
): Promise<{ id: string; role: UserRole }> => {
  const response = await axiosInstance.put(`users/${id}/role`, payload);
  return unwrap(response);
};

export const deleteUser = async (id: string): Promise<void> => {
  const response = await axiosInstance.delete(`users/${id}`);
  unwrap(response);
};
