"use client";

import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { useRouter } from "next/navigation";
import { useState, startTransition } from "react";
import { login } from "../slices/authSlice";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { toast } from "react-toastify";
import AuthLayout from "./AuthLayout";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isLoading = useAppSelector((state) => state.auth.isLoading);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    try {
      await dispatch(login({ email, password })).unwrap();
      startTransition(() => {
        router.push("/verify-otp");
      });
    } catch (err) {
      const message =
        typeof err === "string" ? err : "Invalid email or password";
      toast.error(message);
    }
  };

  return (
    <AuthLayout title="CRM Admin" description="Sign in to your account">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className="text-slate-400">
            Email
          </Label>
          <Input
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password" className="text-slate-400">
            Password
          </Label>
          <Input
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-white text-black hover:bg-slate-100"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default LoginForm;
