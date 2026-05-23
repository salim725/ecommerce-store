"use client";

import { useId } from "react";
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
  onNext: (data: ShippingData) => void;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-xs text-destructive">
      {message}
    </p>
  );
}

export default function ShippingForm({ onNext }: Props) {
  const formId = useId();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingData>();

  const field = (name: keyof ShippingData) => {
    const errorId = `${formId}-${name}-error`;
    const error = errors[name];
    return {
      errorId,
      inputProps: {
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error ? errorId : undefined,
      },
    };
  };

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <h2 className="text-xl font-bold">Contact &amp; shipping</h2>

      <div>
        <Label htmlFor={`${formId}-fullName`}>Full Name</Label>
        <Input
          id={`${formId}-fullName`}
          {...register("fullName", { required: "Full name is required" })}
          {...field("fullName").inputProps}
          placeholder="John Doe"
        />
        <FieldError
          id={field("fullName").errorId}
          message={errors.fullName?.message}
        />
      </div>

      <div>
        <Label htmlFor={`${formId}-address`}>Address</Label>
        <Input
          id={`${formId}-address`}
          {...register("address", { required: "Address is required" })}
          {...field("address").inputProps}
          placeholder="123 Main St"
        />
        <FieldError
          id={field("address").errorId}
          message={errors.address?.message}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`${formId}-city`}>City</Label>
          <Input
            id={`${formId}-city`}
            {...register("city", { required: "City is required" })}
            {...field("city").inputProps}
            placeholder="Tel Aviv"
          />
          <FieldError
            id={field("city").errorId}
            message={errors.city?.message}
          />
        </div>
        <div>
          <Label htmlFor={`${formId}-postalCode`}>Postal Code</Label>
          <Input
            id={`${formId}-postalCode`}
            {...register("postalCode", { required: "Postal code is required" })}
            {...field("postalCode").inputProps}
            placeholder="12345"
          />
          <FieldError
            id={field("postalCode").errorId}
            message={errors.postalCode?.message}
          />
        </div>
      </div>

      <div>
        <Label htmlFor={`${formId}-country`}>Country</Label>
        <Input
          id={`${formId}-country`}
          {...register("country", { required: "Country is required" })}
          {...field("country").inputProps}
          placeholder="Israel"
        />
        <FieldError
          id={field("country").errorId}
          message={errors.country?.message}
        />
      </div>

      <div>
        <Label htmlFor={`${formId}-phone`}>Phone</Label>
        <Input
          id={`${formId}-phone`}
          {...register("phone", { required: "Phone is required" })}
          {...field("phone").inputProps}
          placeholder="+972 50 000 0000"
        />
        <FieldError
          id={field("phone").errorId}
          message={errors.phone?.message}
        />
      </div>

      <Button type="submit" className="w-full min-h-11" size="lg">
        Continue to payment
      </Button>
    </form>
  );
}
