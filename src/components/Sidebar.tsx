import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  MessageSquare,
  Users,
  Settings,
  TestTube,
  FileText,
  Shield,
  Home,
  Zap,
  Target,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "campaigns", label: "Campaigns", icon: Target },
  { id: "ab-testing", label: "A/B Testing", icon: TestTube },
  { id: "templates", label: "Templates", icon: FileText },
  { id: "customers", label: "Customers", icon: Users },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "chat-preview", label: "Chat Preview", icon: MessageSquare },
  { id: "compliance", label: "Compliance", icon: Shield },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn(
      "bg-card border-r border-border transition-smooth h-screen flex flex-col shadow-card",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="font-bold text-lg text-gradient-primary">WhatsApp AI</h1>
              <p className="text-xs text-muted-foreground">Marketing Suite</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-11",
                isCollapsed && "justify-center px-0",
                isActive && "bg-primary text-primary-foreground shadow-card"
              )}
              onClick={() => onTabChange(item.id)}
            >
              <Icon className="w-5 h-5" />
              {!isCollapsed && <span>{item.label}</span>}
            </Button>
          );
        })}
      </nav>

      {/* Upgrade Banner */}
      {!isCollapsed && (
        <div className="p-4">
          <div className="bg-gradient-hero rounded-lg p-4 text-center text-primary-foreground">
            <TrendingUp className="w-8 h-8 mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Pro Features</h3>
            <p className="text-sm opacity-90 mb-3">Unlock advanced RL optimization</p>
            <Button variant="glass" size="sm" className="w-full">
              Upgrade Now
            </Button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full"
        >
          {isCollapsed ? "→" : "←"}
        </Button>
      </div>
    </div>
  );
}