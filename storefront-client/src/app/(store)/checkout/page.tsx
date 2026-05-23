import CheckoutStepper from "@/src/features/checkout/components/CheckoutStepper";

export default function CheckoutPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-center mb-6">Checkout</h1>
      <CheckoutStepper />
    </main>
  );
}