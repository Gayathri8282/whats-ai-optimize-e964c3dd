import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { DataDrivenDashboard } from "@/components/DataDrivenDashboard";
import { CampaignManager } from "@/components/CampaignManager";
import { ABTesting } from "@/components/ABTesting";
import { Analytics } from "@/components/Analytics";
import { CustomerManagement } from "@/components/CustomerManagement";
import { ChatPreview } from "@/components/ChatPreview";
import { ComplianceDashboard } from "@/components/ComplianceDashboard";
import { SettingsPage } from "@/components/SettingsPage";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DataDrivenDashboard />;
      case "campaigns":
        return <CampaignManager />;
      case "ab-testing":
        return <ABTesting />;
      case "analytics":
        return <Analytics />;
      case "templates":
        return <div className="p-8 text-center"><h2 className="text-2xl font-bold">Templates Management</h2><p className="text-muted-foreground">Coming soon...</p></div>;
      case "customers":
        return <CustomerManagement />;
      case "chat-preview":
        return <ChatPreview />;
      case "compliance":
        return <ComplianceDashboard />;
      case "settings":
        return <SettingsPage />;
      default:
        return <DataDrivenDashboard />;
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
