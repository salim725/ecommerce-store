"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/src/store/store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import Navbar from "@/src/shared/components/Navbar";
import { fetchMe } from "@/src/features/auth/slices/authSlice";
import { loadGuestCart } from "@/src/features/cart/slices/cartSlice";
import { getAuthToken, setAuthToken } from "@/src/shared/utils/authToken";

function AppContent({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // On every page load, try to restore the user session from the saved token
    const token = getAuthToken();
    if (token) {
      setAuthToken(token);
      store.dispatch(fetchMe());
    } else {
      store.dispatch(loadGuestCart());
    }
  }, []);

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col antialiased">
        <Provider store={store}>
          <AppContent>{children}</AppContent>
          <ToastContainer position="top-right" autoClose={3000} theme="light" />
        </Provider>
      </body>
    </html>
  );
}

//<Provider> wraps the entire app so every component can access the Redux store. 
// <ToastContainer> is placed once here — then anywhere in the app you can call 
// toast.success("Done!") and it will show up.