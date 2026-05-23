"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/src/store/store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "@/src/shared/components/Navbar";
import Footer from "@/src/shared/components/Footer";
import MiniCartDrawer from "@/src/features/cart/components/MiniCartDrawer";
import { fetchMe } from "@/src/features/auth/slices/authSlice";
import { fetchCart, loadGuestCart } from "@/src/features/cart/slices/cartSlice";
import { getAuthToken } from "@/src/shared/utils/authToken";

function AppContent({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      store.dispatch(fetchMe());
      store.dispatch(fetchCart());
    } else {
      store.dispatch(loadGuestCart());
    }
  }, []);

  return (
    <>
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
      <MiniCartDrawer />
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
