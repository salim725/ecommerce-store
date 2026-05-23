import axiosInstance from "@/src/shared/services/axiosInstance";
export const registerUser = (data: {
  name: string;
  email: string;
  password: string;
}) => axiosInstance.post("/auth/register", data);
//Sends name + email + password to the backend. Returns { user, token }.

export const loginUser = (credentials: { email: string; password: string }) =>
  axiosInstance.post("/auth/login", credentials);
//Sends email + password. Returns { user, token }.

export const logoutUser = () =>
    axiosInstance.post("/auth/logout");
  
  export const getMe = () =>
    axiosInstance.get("/auth/me");
  //getMe is called when the app starts — it uses the saved token to re-fetch the user, so they stay logged in after a page refresh.