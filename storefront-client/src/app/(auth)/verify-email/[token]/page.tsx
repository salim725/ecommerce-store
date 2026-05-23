"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useVerifyEmailMutation } from "@/src/features/auth/api/authApi";
import { Button } from "@/components/ui/button";

export default function VerifyEmailTokenPage() {
  const { token } = useParams<{ token: string }>();
  const [verifyEmail] = useVerifyEmailMutation();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Verifying your email…");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    verifyEmail(token)
      .unwrap()
      .then(() => {
        setStatus("success");
        setMessage("Your email has been verified. You can now sign in.");
      })
      .catch((err: unknown) => {
        setStatus("error");
        const msg =
          err && typeof err === "object" && "data" in err
            ? String((err as { data?: string }).data)
            : "This link is invalid or has expired.";
        setMessage(msg);
      });
  }, [token, verifyEmail]);

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-2xl font-bold">
          {status === "loading"
            ? "Verifying…"
            : status === "success"
              ? "Email verified"
              : "Verification failed"}
        </h1>
        <p className="text-sm text-muted-foreground">{message}</p>
        {status !== "loading" && (
          <Button asChild className="w-full">
            <Link href="/login">Go to login</Link>
          </Button>
        )}
      </div>
    </main>
  );
}
