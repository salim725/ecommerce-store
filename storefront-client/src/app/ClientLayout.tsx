"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/src/store/store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "@/src/shared/components/Navbar";
import Footer from "@/src/shared/components/Footer";
import { fetchMe } from "@/src/features/auth/slices/authSlice";
import { loadGuestCart } from "@/src/features/cart/slices/cartSlice";

function AppContent({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const token = localStorage.getItem("sf_token");
    if (token) {
      store.dispatch(fetchMe());
    } else {
      store.dispatch(loadGuestCart());
    }
  }, []);

  return (
    <>
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AppContent>{children}</AppContent>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
    </Provider>
  );
}