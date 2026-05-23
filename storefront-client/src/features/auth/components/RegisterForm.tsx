"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { register } from "../slices/authSlice";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading } = useAppSelector((state) => state.auth);

  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
  });
  //Local state for the form fields. useAppSelector reads loading state
  //  from Redux so we can disable the button while submitting.
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      await dispatch(register({
        name: form.name,
        email: form.email,
        password: form.password,
      })).unwrap(); // .unwrap() throws if the thunk was rejected
      toast.success("Account created! Welcome 🎉");
      router.push("/");
    } catch (err: any) {
      toast.error(err);
    }
  };

  //.unwrap() is important — it converts a rejected thunk into 
  // a real thrown error so catch works correctly

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" value={form.name} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Register"}
      </Button>
    </form>
  );
}