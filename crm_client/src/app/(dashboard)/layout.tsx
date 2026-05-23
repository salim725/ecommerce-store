// Theme: dark gradient shell (sidebar + navbar) with light ContentPanel
// surfaces for tables, cards, and dashboard sections inside main.
"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/src/shared/components/Sidebar";
import Navbar from "@/src/shared/components/Navbar";
import { useAppDispatch } from "@/src/store/hook";
import { fetchMe, logout } from "@/src/features/auth/slices/authSlice";
import { getAuthToken } from "@/src/shared/utils/authToken";
import { redirectTo } from "@/src/shared/utils/redirectTo";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      redirectTo("/login");
      return;
    }

    const verifySession = async () => {
      try {
        const result = await dispatch(fetchMe()).unwrap();
        if (result.user.role !== "admin") {
          dispatch(logout());
          redirectTo("/login");
          return;
        }
        setIsAuthorized(true);
      } catch {
        dispatch(logout());
        redirectTo("/login");
      }
    };

    void verifySession();
  }, [dispatch]);

  if (!isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <p className="text-sm text-slate-300">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className="absolute top-20 left-40 w-96 h-96 bg-blue-500 rounded-full opacity-10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-40 w-96 h-96 bg-purple-500 rounded-full opacity-10 blur-3xl pointer-events-none" />

      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
