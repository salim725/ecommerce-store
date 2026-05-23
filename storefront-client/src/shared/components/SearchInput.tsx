"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  startTransition,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 300;

export interface SearchInputProps {
  className?: string;
  placeholder?: string;
  /** Called after navigation (e.g. close mobile sheet) */
  onNavigate?: () => void;
  autoFocus?: boolean;
}

export function SearchInput({
  className,
  placeholder = "Search products…",
  onNavigate,
  autoFocus = false,
}: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const routerReadyRef = useRef(false);

  const urlQuery = searchParams.get("q") ?? "";
  const [draft, setDraft] = useState<string | null>(null);
  const value = draft ?? urlQuery;

  const navigate = useCallback(
    (term: string) => {
      const trimmed = term.trim();
      const params = new URLSearchParams(searchParams.toString());

      if (trimmed) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }

      const query = params.toString();
      const href = query ? `/products?${query}` : "/products";
      if (!routerReadyRef.current) return;
      startTransition(() => {
        router.push(href);
      });
      setDraft(null);
      onNavigate?.();
    },
    [router, searchParams, onNavigate],
  );

  const scheduleNavigate = useCallback(
    (term: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => navigate(term), DEBOUNCE_MS);
    },
    [navigate],
  );

  useEffect(() => {
    routerReadyRef.current = true;
    return () => {
      routerReadyRef.current = false;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setDraft(next);
    scheduleNavigate(next);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setDraft("");
      if (debounceRef.current) clearTimeout(debounceRef.current);
      navigate("");
      inputRef.current?.blur();
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      navigate(value);
    }
  };

  return (
    <div className={cn("relative w-full", className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={false}
        aria-label="Search products"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        autoFocus={autoFocus}
        className="h-10 pl-9 pr-3"
        autoComplete="off"
      />
      <span id={listboxId} className="sr-only">
        Press Enter to search. Results appear on the shop page.
      </span>
    </div>
  );
}
