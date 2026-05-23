"use client";

import { useState } from "react";
import ShippingForm, { type ShippingData } from "./ShippingForm";
import PaymentForm, { type PaymentData } from "./PaymentForm";
import OrderReview from "@/src/features/checkout/components/OrderReview";

// Visual step indicator
function StepIndicator({ current }: { current: number }) {
  const steps = ["Shipping", "Payment", "Review"];
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((label, i) => {
        const step = i + 1;
        const isActive = step === current;
        const isDone = step < current;
        return (
          <div key={label} className="flex items-center">
            {/* Circle */}
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
              ${isDone ? "bg-green-500 text-white" : ""}
              ${isActive ? "bg-primary text-white" : ""}
              ${!isActive && !isDone ? "bg-muted text-muted-foreground" : ""}
            `}>
              {isDone ? "✓" : step}
            </div>
            {/* Label */}
            <span className={`ml-2 text-sm ${isActive ? "font-semibold" : "text-muted-foreground"}`}>
              {label}
            </span>
            {/* Connector line */}
            {i < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-3 ${isDone ? "bg-green-500" : "bg-muted"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
//The step indicator is purely visual — it reads current and colors the circles accordingly. Completed steps show a ✓.
export default function CheckoutStepper() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [shippingData, setShippingData] = useState<ShippingData | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  //All step state lives here. Each child form receives onNext and onBack callbacks — they don't manage navigation themselves.
  const handleShippingNext = (data: ShippingData) => {
    setShippingData(data);
    setCurrentStep(2);
  };

  const handlePaymentNext = (data: PaymentData) => {
    setPaymentData(data);
    setCurrentStep(3);
  };

  return (
    <div className="max-w-lg mx-auto">
      <StepIndicator current={currentStep} />

      {currentStep === 1 && (
        <ShippingForm onNext={handleShippingNext} />
      )}
      {currentStep === 2 && (
        <PaymentForm
          onNext={handlePaymentNext}
          onBack={() => setCurrentStep(1)}
        />
      )}
      {currentStep === 3 && shippingData && (
        <OrderReview
          shippingData={shippingData}
          onBack={() => setCurrentStep(2)}
        />
      )}
    </div>
  );
}
//Clean pattern — currentStep decides which component renders. Data flows up via callbacks, 
// then back down as props. No Redux needed for this local wizard state.