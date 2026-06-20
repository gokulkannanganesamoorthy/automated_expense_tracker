"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Activity, 
  Settings,
  ShieldCheck,
  LifeBuoy
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Users", href: "/users", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "System Health", href: "/system", icon: Activity },
  { name: "Support", href: "/support", icon: LifeBuoy },
  { name: "Admin Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <div className="flex items-center gap-2 text-indigo-600">
          <ShieldCheck className="h-6 w-6" />
          <span className="font-bold text-lg text-gray-900 tracking-tight">TrackerAdmin</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive 
                  ? "bg-indigo-50 text-indigo-700 font-medium" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-indigo-600" : "text-gray-400"}`} />
              {item.name}
            </Link>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="bg-indigo-50 rounded-xl p-4 text-sm">
          <p className="font-semibold text-indigo-900 mb-1">Admin Access</p>
          <p className="text-indigo-700/80 mb-3 text-xs">You have superuser privileges.</p>
        </div>
      </div>
    </div>
  );
}
