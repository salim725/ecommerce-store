"use client";  // needed because Provider and ToastContainer use browser APIs

import { Provider } from "react-redux";
import { store } from "@/src/store/store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";  // required — styles for toast popups
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col antialiased">
        <Provider store={store}>   {/* makes Redux available to every page/component */}
          {children}
          <ToastContainer         // global toast notification container
            position="top-right"
            autoClose={3000}      // disappears after 3 seconds
            theme="light"
          />
        </Provider>
      </body>
    </html>
  );
}

//<Provider> wraps the entire app so every component can access the Redux store. 
// <ToastContainer> is placed once here — then anywhere in the app you can call 
// toast.success("Done!") and it will show up.