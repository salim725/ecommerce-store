"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import ShippingForm, { type ShippingData } from "./ShippingForm";
import PaymentForm, { type PaymentData } from "./PaymentForm";
import OrderReview from "@/src/features/checkout/components/OrderReview";
import { cn } from "@/lib/utils";

function StepIndicator({ current }: { current: number }) {
  const steps = ["Contact & shipping", "Payment", "Review"];

  return (
    <div className="mb-8 overflow-x-auto pb-2">
      <div className="flex min-w-max items-center justify-center px-1">
        {steps.map((label, i) => {
          const step = i + 1;
          const isActive = step === current;
          const isDone = step < current;

          return (
            <div key={label} className="flex items-center">
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                  isDone && "bg-primary text-primary-foreground",
                  isActive && !isDone && "bg-primary text-primary-foreground",
                  !isActive && !isDone && "bg-muted text-muted-foreground",
                )}
              >
                {isDone ? (
                  <Check className="size-4" aria-hidden />
                ) : (
                  step
                )}
              </div>
              <span
                className={cn(
                  "ml-2 whitespace-nowrap text-sm",
                  isActive ? "font-semibold" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
              {i < steps.length - 1 && <StepConnector done={isDone} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepConnector({ done }: { done: boolean }) {
  return (
    <div
      className={cn(
        "mx-3 h-0.5 w-8 shrink-0 sm:w-12",
        done ? "bg-primary" : "bg-muted",
      )}
      aria-hidden
    />
  );
}

export default function CheckoutStepper() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [shippingData, setShippingData] = useState<ShippingData | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  const handleShippingNext = (data: ShippingData) => {
    setShippingData(data);
    setCurrentStep(2);
  };

  const handlePaymentNext = (data: PaymentData) => {
    setPaymentData(data);
    setCurrentStep(3);
  };

  return (
    <div>
      <StepIndicator current={currentStep} />

      {currentStep === 1 && <ShippingForm onNext={handleShippingNext} />}
      {currentStep === 2 && (
        <PaymentForm
          onNext={handlePaymentNext}
          onBack={() => setCurrentStep(1)}
        />
      )}
      {currentStep === 3 && shippingData && paymentData && (
        <OrderReview
          shippingData={shippingData}
          paymentData={paymentData}
          onBack={() => setCurrentStep(2)}
        />
      )}
    </div>
  );
}
