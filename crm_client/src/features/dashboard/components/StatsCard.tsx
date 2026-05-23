import { Card, CardContent } from "@/src/components/ui/card";
import { LucideIcon } from "lucide-react";


interface StatsCardProps {
    title: string;
    value: number | string;
    icon: LucideIcon;
    color: string;
  }

  export default function StatsCard({ title, value, icon: Icon, color }: StatsCardProps) {
    return (
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon size={22} className="text-white" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
 