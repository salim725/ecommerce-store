"use client";

import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export interface ShippingData {
  fullName: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  phone: string;
}

interface Props {
  onNext: (data: ShippingData) => void; // pass data up to CheckoutStepper
}

export default function ShippingForm({ onNext }: Props) {
  const {
    register,       // connects input to react-hook-form
    handleSubmit,   // wraps your onSubmit — validates first, then calls it
    formState: { errors },
  } = useForm<ShippingData>();
  //react-hook-form handles validation without re-rendering on 
  // every keystroke — much more performant than useState for forms.
  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <h2 className="text-xl font-bold">Shipping Information</h2>

      <div>
        <Label>Full Name</Label>
        <Input
          {...register("fullName", { required: "Full name is required" })}
          placeholder="John Doe"
        />
        {errors.fullName && (
          <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>
        )}
      </div>

      <div>
        <Label>Address</Label>
        <Input
          {...register("address", { required: "Address is required" })}
          placeholder="123 Main St"
        />
        {errors.address && (
          <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>City</Label>
          <Input
            {...register("city", { required: "City is required" })}
            placeholder="Tel Aviv"
          />
          {errors.city && (
            <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
          )}
        </div>
        <div>
          <Label>Postal Code</Label>
          <Input
            {...register("postalCode", { required: "Postal code is required" })}
            placeholder="12345"
          />
          {errors.postalCode && (
            <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label>Country</Label>
        <Input
          {...register("country", { required: "Country is required" })}
          placeholder="Israel"
        />
        {errors.country && (
          <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>
        )}
      </div>

      <div>
        <Label>Phone</Label>
        <Input
          {...register("phone", { required: "Phone is required" })}
          placeholder="+972 50 000 0000"
        />
        {errors.phone && (
          <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" size="lg">
        Continue to Payment →
      </Button>
    </form>
  );
}
//When the user clicks submit, handleSubmit runs validation first.
//  If all fields pass → it calls onNext(data)
//  which passes the shipping data up to the parent CheckoutStepper. No API call yet.