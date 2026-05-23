"use client";

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
  onBack: () => void; // go back to step 1
}

export default function PaymentForm({ onNext, onBack }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<PaymentData>();

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <h2 className="text-xl font-bold">Payment Details</h2>

      {/* Simulated payment notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
        ⚠️ This is a simulated payment — no real charges will be made.
      </div>

      <div>
        <Label>Card Number</Label>
        <Input
          {...register("cardNumber", {
            required: "Card number is required",
            pattern: { value: /^\d{16}$/, message: "Enter 16 digits" },
          })}
          placeholder="1234567890123456"
          maxLength={16}
        />
        {errors.cardNumber && (
          <p className="text-red-500 text-xs mt-1">{errors.cardNumber.message}</p>
        )}
      </div>

      <div>
        <Label>Cardholder Name</Label>
        <Input
          {...register("cardName", { required: "Name is required" })}
          placeholder="John Doe"
        />
        {errors.cardName && (
          <p className="text-red-500 text-xs mt-1">{errors.cardName.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Expiry Date</Label>
          <Input
            {...register("expiry", {
              required: "Expiry is required",
              pattern: { value: /^(0[1-9]|1[0-2])\/\d{2}$/, message: "Format: MM/YY" },
            })}
            placeholder="MM/YY"
            maxLength={5}
          />
          {errors.expiry && (
            <p className="text-red-500 text-xs mt-1">{errors.expiry.message}</p>
          )}
        </div>
        <div>
          <Label>CVV</Label>
          <Input
            {...register("cvv", {
              required: "CVV is required",
              pattern: { value: /^\d{3,4}$/, message: "3 or 4 digits" },
            })}
            placeholder="123"
            maxLength={4}
            type="password"
          />
          {errors.cvv && (
            <p className="text-red-500 text-xs mt-1">{errors.cvv.message}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
          ← Back
        </Button>
        <Button type="submit" className="flex-1">
          Review Order →
        </Button>
      </div>
    </form>
  );
}
//CVV is type="password" so it's masked. Again, onNext just passes data up — no API call yet.