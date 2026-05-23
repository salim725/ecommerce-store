import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
});

// Request interceptor — runs BEFORE every request is sent
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      // only runs in browser (not SSR)
      const token = localStorage.getItem("sf_token"); // grab saved JWT
      if (token) {
        config.headers.Authorization = `Bearer ${token}`; // attach it to the request
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

//Every time the app makes an API call, this automatically attaches the user's token to the header — so the backend knows who's making the request.
// Response interceptor — runs AFTER every response comes back
axiosInstance.interceptors.response.use(
  (response) => response, // success: just pass the response through
  (error) => {
    if (error.response?.status === 401) {
      // 401 = Unauthorized (token expired)
      if (typeof window !== "undefined") {
        localStorage.removeItem("sf_token"); // delete the bad token
        window.location.href = "/login"; // kick user to login page
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;

//If the backend says "401 Unauthorized" (token expired or invalid), this automatically logs the user out and redirects to /login — no need to handle this in every component.
