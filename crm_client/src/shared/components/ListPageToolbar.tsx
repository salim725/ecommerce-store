"use client";

import { useEffect, useState } from "react";
import { Input } from "@/src/components/ui/input";
import { Search } from "lucide-react";

interface ListPageToolbarProps {
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  statusFilter?: React.ReactNode;
  categoryFilter?: React.ReactNode;
}

export default function ListPageToolbar({
  onSearchChange,
  searchPlaceholder = "Search…",
  statusFilter,
  categoryFilter,
}: ListPageToolbarProps) {
  const [input, setInput] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => onSearchChange(input.trim()), 300);
    return () => clearTimeout(timer);
  }, [input, onSearchChange]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative flex-1 min-w-[200px]">
        <Search
          className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400"
          aria-hidden
        />
        <Input
          type="search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9"
          aria-label="Search list"
        />
      </div>
      {statusFilter}
      {categoryFilter}
    </div>
  );
}
