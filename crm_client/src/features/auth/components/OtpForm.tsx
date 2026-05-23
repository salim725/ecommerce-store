"use client";

import { useState, useEffect, startTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { redirectTo } from "@/src/shared/utils/redirectTo";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { verify2FA } from "../slices/authSlice";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import AuthLayout from "./AuthLayout";

export const OtpForm = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [otp, setOtp] = useState("");

  const pendingEmail = useAppSelector((state) => state.auth.pendingEmail);
  const token = useAppSelector((state) => state.auth.token);
  const isLoading = useAppSelector((state) => state.auth.isLoading);

  // Only guard unauthenticated visits — pendingEmail is cleared on successful verify.
  useEffect(() => {
    if (!pendingEmail && !token) {
      redirectTo("/login");
    }
  }, [pendingEmail, token]);

  if (!pendingEmail) {
    return null;
  }

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    try {
      await dispatch(
        verify2FA({ email: pendingEmail, code: otp }),
      ).unwrap();
      startTransition(() => {
        router.push("/");
      });
    } catch (err) {
      const message =
        typeof err === "string" ? err : "Invalid OTP code";
      toast.error(message);
    }
  };

  return (
    <AuthLayout
      title="Check your email"
      description="Enter the OTP code we sent you"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="otp" className="text-slate-400">
            OTP code
          </Label>
          <Input
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            id="otp"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
            maxLength={6}
            required
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-white text-black hover:bg-slate-100"
          disabled={isLoading}
        >
          {isLoading ? "Verifying..." : "Verify"}
        </Button>
      </form>
    </AuthLayout>
  );
};
