import axiosInstance from "@/src/shared/services/axiosInstance";

export const getProfile = () => axiosInstance.get("/users/profile");

export const updateProfile = (data: { name?: string }) =>
  axiosInstance.put("/users/profile", data);

export const changePassword = (data: {
  oldPassword: string;
  newPassword: string;
}) =>
  axiosInstance.put("/users/change-password", {
    currentPassword: data.oldPassword,
    newPassword: data.newPassword,
  });

export const getMyOrders = () => axiosInstance.get("/orders/my-order");

export const getOrderById = (id: string) =>
  axiosInstance.get(`/orders/${id}`);
