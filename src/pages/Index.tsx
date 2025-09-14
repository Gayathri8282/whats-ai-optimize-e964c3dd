import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { CampaignManager } from "@/components/CampaignManager";
import { ABTesting } from "@/components/ABTesting";
import { Analytics } from "@/components/Analytics";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "campaigns":
        return <CampaignManager />;
      case "ab-testing":
        return <ABTesting />;
      case "analytics":
        return <Analytics />;
      case "templates":
        return <div className="p-8 text-center"><h2 className="text-2xl font-bold">Templates Management</h2><p className="text-muted-foreground">Coming soon...</p></div>;
      case "customers":
        return <div className="p-8 text-center"><h2 className="text-2xl font-bold">Customer Management</h2><p className="text-muted-foreground">Coming soon...</p></div>;
      case "chat-preview":
        return <div className="p-8 text-center"><h2 className="text-2xl font-bold">Chat Preview</h2><p className="text-muted-foreground">Coming soon...</p></div>;
      case "compliance":
        return <div className="p-8 text-center"><h2 className="text-2xl font-bold">Compliance Dashboard</h2><p className="text-muted-foreground">Coming soon...</p></div>;
      case "settings":
        return <div className="p-8 text-center"><h2 className="text-2xl font-bold">Settings</h2><p className="text-muted-foreground">Coming soon...</p></div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 p-8 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
