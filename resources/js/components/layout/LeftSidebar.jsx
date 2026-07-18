import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Settings, Stethoscope, Wrench } from "lucide-react";
import { __ } from "@/i18n";

const navItems = [
  { id: "dashboard", label: __("Dashboard", "http-headers-advanced"), icon: LayoutDashboard },
  { id: "settings", label: __("Settings", "http-headers-advanced"), icon: Settings },
  { id: "diagnostics", label: __("Diagnostics", "http-headers-advanced"), icon: Stethoscope },
  { id: "tools", label: __("Tools", "http-headers-advanced"), icon: Wrench },
];

export default function LeftSidebar({ activeTab, onChange, isDark, assetBaseUrl }) {
  return (
    <aside className="w-64 flex flex-col border-r border-border bg-background">
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3",
                activeTab === item.id && "font-medium"
              )}
              onClick={() => onChange(item.id)}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}
