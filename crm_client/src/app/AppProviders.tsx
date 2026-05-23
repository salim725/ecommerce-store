"use client";

import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import { store } from "@/src/store/store";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      {children}
      <ToastContainer />
    </Provider>
  );
}
