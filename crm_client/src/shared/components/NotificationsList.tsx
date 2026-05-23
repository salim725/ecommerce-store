"use client";

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

export default function NotificationsList() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.notifications.items);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {notifications.length === 0
            ? "No notifications"
            : unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "All read"}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => dispatch(markAllAsRead())}
            className="gap-2 border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
          >
            <CheckCheck aria-hidden />
            Mark all read
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => dispatch(clearAll())}
            className="gap-2 border-gray-300 bg-white text-gray-900 hover:bg-gray-50 text-destructive hover:text-destructive"
          >
            <Trash2 aria-hidden />
            Clear all
          </Button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <Bell size={48} strokeWidth={1} className="mb-4" aria-hidden />
          <p className="text-lg font-medium text-gray-600">No notifications yet</p>
          <p className="text-sm mt-1">
            They will appear here when actions happen
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => dispatch(markAsRead(n.id))}
              className={`flex w-full items-start gap-4 p-4 rounded-xl border text-left cursor-pointer transition-all duration-200
                ${
                  n.read
                    ? "bg-gray-50 border-gray-100 opacity-60"
                    : `${typeBgOnLight[n.type]} hover:brightness-[0.98]`
                }`}
            >
              <span
                className={`mt-1.5 shrink-0 w-2.5 h-2.5 rounded-full ${typeDotColor[n.type]}`}
                aria-hidden
              />
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${typeTextColorOnLight[n.type]}`}
                >
                  {n.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(n.createdAt).toLocaleString([], {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              {!n.read && (
                <span className="shrink-0 text-[10px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                  NEW
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
