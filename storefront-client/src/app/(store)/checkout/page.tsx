import CheckoutStepper from "@/src/features/checkout/components/CheckoutStepper";
import OrderSummaryPanel from "@/src/features/checkout/components/OrderSummaryPanel";

export default function CheckoutPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-bold">Checkout</h1>

      <details className="mb-6 rounded-xl border bg-card p-4 lg:hidden">
        <summary className="cursor-pointer text-sm font-medium">
          Order summary
        </summary>
        <div className="mt-4">
          <OrderSummaryPanel />
        </div>
      </details>

      <div className="grid gap-10 lg:grid-cols-[11fr_9fr]">
        <CheckoutStepper />
        <OrderSummaryPanel className="hidden lg:block" />
      </div>
    </main>
  );
}
