import { Bell } from "lucide-react";
import NotificationsList from "@/src/shared/components/NotificationsList";
import ContentPanel from "@/src/shared/components/ContentPanel";

export default function NotificationsPage() {
  return (
    <div className="space-y-4">
      <ContentPanel className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell size={22} className="text-blue-600" aria-hidden />
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            View and manage your activity alerts
          </p>
        </div>
        <NotificationsList />
      </ContentPanel>
    </div>
  );
}
