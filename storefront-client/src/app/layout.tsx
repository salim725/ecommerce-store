// src/app/layout.tsx
// Remove "use client" from the top level
// Keep "use client" only on the inner AppContent component

import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./ClientLayout"; // we'll create this below

export const metadata: Metadata = {
  title: {
    default: "Storefront",
    template: "%s | Storefront", // e.g. "Sneakers | Storefront"
  },
  description: "Your one-stop online shop for the best products.",
  openGraph: {
    siteName: "Storefront",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}