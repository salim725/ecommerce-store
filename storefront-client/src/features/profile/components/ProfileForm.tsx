"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { updateProfile } from "../slices/profileSlice";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Spinner from "@/src/shared/components/Spinner";

interface ProfileFormData {
  name: string;
  phone: string;
  address: string;
}

export default function ProfileForm() {
  const dispatch = useAppDispatch();
  const { profile, isLoading } = useAppSelector((s) => s.profile);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormData>();
  // Pre-fill the form with current profile data when it loads
  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || "",
        phone: profile.phone || "",
        address: profile.address || "",
      });
    }
  }, [profile, reset]);

  if (isLoading && !profile) {
    return (
      <div className="flex justify-center py-10">
        <Spinner size="lg" />
      </div>
    );
  }

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await dispatch(updateProfile(data)).unwrap();
      toast.success("Profile updated ✅");
    } catch (err: any) {
      toast.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <div>
        <Label>Name</Label>
        <Input
          {...register("name", { required: "Name is required" })}
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label>Email</Label>
        {/* Email shown but not editable */}
        <Input value={profile?.email || ""} disabled className="bg-muted" />
        <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
      </div>

      <div>
        <Label>Phone</Label>
        <Input {...register("phone")} placeholder="+972 50 000 0000" />
      </div>

      <div>
        <Label>Address</Label>
        <Input {...register("address")} placeholder="123 Main St, Tel Aviv" />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}