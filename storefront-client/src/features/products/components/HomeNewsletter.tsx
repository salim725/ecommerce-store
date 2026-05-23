"use client";

import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function HomeNewsletter() {
  return (
    <section className="border-t bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-background border">
            <Mail className="size-5 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold sm:text-2xl">Stay in the loop</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            New arrivals, restocks, and exclusive offers — no spam, unsubscribe
            anytime.
          </p>
          <form
            className="mt-6 flex flex-col gap-2 sm:flex-row"
            onSubmit={(e) => e.preventDefault()}
          >
            <Input
              type="email"
              placeholder="you@example.com"
              className="h-10 bg-background flex-1"
              aria-label="Email address"
            />
            <Button type="submit" className="h-10 shrink-0">
              Subscribe
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
