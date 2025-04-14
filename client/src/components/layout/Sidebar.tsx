import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  DollarSign, 
  Files, 
  BarChart3, 
  Settings, 
  LogOut 
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/transactions", label: "Transactions", icon: DollarSign },
  { href: "/categories", label: "Categories", icon: Files },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 border-r border-gray-200 bg-white hidden md:block">
      <div className="h-full flex flex-col">
        <nav className="space-y-1 p-4 flex-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  isActive 
                    ? "bg-primary-50 text-primary-700" 
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon 
                  className={cn(
                    "h-5 w-5 mr-3",
                    isActive ? "text-primary-700" : "text-gray-500"
                  )} 
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <Link
            href="/logout"
            className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          >
            <LogOut className="h-5 w-5 mr-3 text-gray-500" />
            Logout
          </Link>
        </div>
      </div>
    </aside>
  );
}
