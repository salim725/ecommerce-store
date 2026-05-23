import axiosInstance from "@/src/shared/services/axiosInstance";
import { unwrap } from "@/src/shared/services/apiResponse";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface Verify2FaPayload {
  email: string;
  code: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Verify2FaResponse {
  token: string;
}

export const loginAdmin = async (
  credentials: LoginCredentials,
): Promise<null> => {
  const response = await axiosInstance.post("auth/admin/login", credentials);
  return unwrap(response);
};

export const verifyAdmin2Fa = async (
  payload: Verify2FaPayload,
): Promise<Verify2FaResponse> => {
  const response = await axiosInstance.post(
    "auth/admin/verify-2fa",
    payload,
  );
  return unwrap(response);
};

export const getMe = async (): Promise<AuthUser> => {
  const response = await axiosInstance.get("auth/me");
  return unwrap(response);
};
