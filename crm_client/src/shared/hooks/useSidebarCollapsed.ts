"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "sidebarCollapsed";

let collapsed = false;
const listeners = new Set<() => void>();

function readCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return collapsed;
}

function getServerSnapshot() {
  return false;
}

function setCollapsed(next: boolean) {
  collapsed = next;
  localStorage.setItem(STORAGE_KEY, String(next));
  listeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  collapsed = readCollapsed();
}

export function useSidebarCollapsed() {
  const isCollapsed = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const toggle = useCallback(() => {
    setCollapsed(!collapsed);
  }, []);

  return { collapsed: isCollapsed, toggle };
}
