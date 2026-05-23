"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import {
  markAsRead,
  markAllAsRead,
  clearAll,
} from "@/src/shared/slices/notificationsSlice";
import {
  typeTextColorOnLight,
  typeDotColor,
  typeBgOnLight,
} from "@/src/shared/constants/notificationStyles";
import { Button } from "@/src/components/ui/button";

export default function NotificationBell() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.notifications.items);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="relative rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white/70"
      >
        <Bell aria-hidden />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 z-50 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div>
              <span className="text-sm font-semibold text-gray-900">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="ml-2 text-xs text-gray-500">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Mark all as read"
                onClick={() => dispatch(markAllAsRead())}
                className="text-gray-500 hover:text-emerald-600"
              >
                <CheckCheck aria-hidden />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Clear all notifications"
                onClick={() => dispatch(clearAll())}
                className="text-gray-500 hover:text-red-600"
              >
                <Trash2 aria-hidden />
              </Button>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-8">
                No notifications yet
              </p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => dispatch(markAsRead(n.id))}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                    n.read ? "opacity-60" : typeBgOnLight[n.type]
                  }`}
                >
                  <span
                    className={`mt-1.5 shrink-0 w-2 h-2 rounded-full ${typeDotColor[n.type]}`}
                    aria-hidden
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-medium leading-snug ${typeTextColorOnLight[n.type]}`}
                    >
                      {n.message}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {new Date(n.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {!n.read && (
                    <span
                      className="shrink-0 w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full"
                      aria-hidden
                    />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
