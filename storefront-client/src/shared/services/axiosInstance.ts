import axios from "axios";
import { getAuthToken, clearAuthToken, setAuthToken } from "@/src/shared/utils/authToken";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  withCredentials: true,
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = axios
    .post<{ data?: { token: string } }>(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
      {},
      { withCredentials: true },
    )
    .then((res) => {
      const body = res.data as { data?: { token: string }; success?: boolean };
      const token = body?.data?.token ?? null;
      if (token) setAuthToken(token);
      return token;
    })
    .catch(() => null)
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

// Request interceptor — runs BEFORE every request is sent
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      typeof window !== "undefined" &&
      !String(originalRequest.url ?? "").includes("auth/")
    ) {
      originalRequest._retry = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      }
      clearAuthToken();
      window.location.href = "/login";
    } else if (error.response?.status === 401 && typeof window !== "undefined") {
      clearAuthToken();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;

//If the backend says "401 Unauthorized" (token expired or invalid), this automatically logs the user out and redirects to /login — no need to handle this in every component.
