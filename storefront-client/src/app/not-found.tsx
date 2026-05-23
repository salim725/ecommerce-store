import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <p className="text-8xl font-bold text-muted-foreground/30">404</p>
      <h1 className="text-2xl font-bold mt-4 mb-2">Page Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-sm">
        Looks like this page took the day off. Let's get you back on track.
      </p>
      <Button asChild size="lg">
        <Link href="/">Go Home</Link>
      </Button>
    </main>
  );
}