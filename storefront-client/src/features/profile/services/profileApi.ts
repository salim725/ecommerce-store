import axiosInstance from "@/src/shared/services/axiosInstance";

export const getMe = () => axiosInstance.get("/auth/me");

//Same endpoint as auth's getMe —
// but here we use it specifically to load the profile page data.
export const updateProfile = (data: {
  name?: string;
  phone?: string;
  address?: string;
}) => axiosInstance.put("/auth/me", data);

export const changePassword = (data: {
  oldPassword: string;
  newPassword: string;
}) => axiosInstance.put("/auth/me/password", data);

export const getMyOrders = () => axiosInstance.get("/orders/my");

export const getOrderById = (id: string) =>
  axiosInstance.get(`/orders/my/${id}`);
