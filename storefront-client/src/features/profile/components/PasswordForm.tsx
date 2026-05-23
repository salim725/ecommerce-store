"use client";

import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { changePassword } from "../slices/profileSlice";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/src/shared/utils/getErrorMessage";

interface PasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function PasswordForm() {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((s) => s.profile);

  const { register, handleSubmit, watch, reset, formState: { errors } } =
    useForm<PasswordFormData>();
    const onSubmit = async (data: PasswordFormData) => {
        if (data.newPassword !== data.confirmPassword) {
          toast.error("New passwords do not match");
          return;
        }
        try {
          await dispatch(changePassword({
            oldPassword: data.oldPassword,
            newPassword: data.newPassword,
          })).unwrap();
          toast.success("Password changed successfully 🔒");
          reset(); // clear the form after success
        } catch (err: unknown) {
          toast.error(getErrorMessage(err, "Password change failed"));
        }
      };
    
      return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
          <div>
            <Label>Current Password</Label>
            <Input
              type="password"
              {...register("oldPassword", { required: "Current password is required" })}
            />
            {errors.oldPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.oldPassword.message}</p>
            )}
          </div>
    
          <div>
            <Label>New Password</Label>
            <Input
              type="password"
              {...register("newPassword", {
                required: "New password is required",
                minLength: { value: 6, message: "At least 6 characters" },
              })}
            />
            {errors.newPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>
            )}
          </div>
    
          <div>
            <Label>Confirm New Password</Label>
            <Input
              type="password"
              {...register("confirmPassword", { required: "Please confirm your password" })}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>
    
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Changing..." : "Change Password"}
          </Button>
        </form>
      );
    }