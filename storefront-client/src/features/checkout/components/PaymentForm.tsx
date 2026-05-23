"use client";

import { useId } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export interface PaymentData {
  cardNumber: string;
  cardName: string;
  expiry: string;
  cvv: string;
}

interface Props {
  onNext: (data: PaymentData) => void;
  onBack: () => void;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-xs text-destructive">
      {message}
    </p>
  );
}

export default function PaymentForm({ onNext, onBack }: Props) {
  const formId = useId();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentData>();

  const field = (name: keyof PaymentData) => {
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
      <h2 className="text-xl font-bold">Payment details</h2>

      <div className="rounded-lg border border-border bg-muted/50 p-3 text-sm text-muted-foreground">
        This is a simulated payment — no real charges will be made.
      </div>

      <div>
        <Label htmlFor={`${formId}-cardNumber`}>Card Number</Label>
        <Input
          id={`${formId}-cardNumber`}
          {...register("cardNumber", {
            required: "Card number is required",
            pattern: { value: /^\d{16}$/, message: "Enter 16 digits" },
          })}
          {...field("cardNumber").inputProps}
          placeholder="1234567890123456"
          maxLength={16}
        />
        <FieldError
          id={field("cardNumber").errorId}
          message={errors.cardNumber?.message}
        />
      </div>

      <div>
        <Label htmlFor={`${formId}-cardName`}>Cardholder Name</Label>
        <Input
          id={`${formId}-cardName`}
          {...register("cardName", { required: "Name is required" })}
          {...field("cardName").inputProps}
          placeholder="John Doe"
        />
        <FieldError
          id={field("cardName").errorId}
          message={errors.cardName?.message}
        />
      </div>

      <PaymentFieldGrid>
        <div>
          <Label htmlFor={`${formId}-expiry`}>Expiry Date</Label>
          <Input
            id={`${formId}-expiry`}
            {...register("expiry", {
              required: "Expiry is required",
              pattern: {
                value: /^(0[1-9]|1[0-2])\/\d{2}$/,
                message: "Format: MM/YY",
              },
            })}
            {...field("expiry").inputProps}
            placeholder="MM/YY"
            maxLength={5}
          />
          <FieldError
            id={field("expiry").errorId}
            message={errors.expiry?.message}
          />
        </div>
        <div>
          <Label htmlFor={`${formId}-cvv`}>CVV</Label>
          <Input
            id={`${formId}-cvv`}
            {...register("cvv", {
              required: "CVV is required",
              pattern: { value: /^\d{3,4}$/, message: "3 or 4 digits" },
            })}
            {...field("cvv").inputProps}
            placeholder="123"
            maxLength={4}
            type="password"
          />
          <FieldError
            id={field("cvv").errorId}
            message={errors.cvv?.message}
          />
        </div>
      </PaymentFieldGrid>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" className="flex-1 min-h-11">
          Review order
        </Button>
      </div>
    </form>
  );
}

function PaymentFieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>;
}
