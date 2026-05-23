"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/src/store/hooks";
import { fetchProfile, fetchMyOrders } from "@/src/features/profile/slices/profileSlice";
import ProfileForm from "@/src/features/profile/components/ProfileForm";
import PasswordForm from "@/src/features/profile/components/PasswordForm";
import OrdersHistory from "@/src/features/profile/components/OrdersHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProfilePage() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchMyOrders());
  }, [dispatch]);
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">My Account</h1>

      <Tabs defaultValue="info">
        <TabsList className="mb-6">
          <TabsTrigger value="info">My Info</TabsTrigger>
          <TabsTrigger value="password">Change Password</TabsTrigger>
          <TabsTrigger value="orders">My Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <ProfileForm />
        </TabsContent>

        <TabsContent value="password">
          <PasswordForm />
        </TabsContent>

        <TabsContent value="orders">
          <OrdersHistory />
        </TabsContent>
      </Tabs>
    </main>
  );
}