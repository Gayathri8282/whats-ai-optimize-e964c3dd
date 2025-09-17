import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileText,
  Users,
  MessageSquare,
  Download,
  Upload,
  Settings,
  Clock,
  Globe,
  Lock
} from "lucide-react";

interface ComplianceItem {
  id: string;
  name: string;
  status: 'compliant' | 'warning' | 'violation';
  description: string;
  lastChecked: Date;
  action?: string;
}

export function ComplianceDashboard() {
  const [complianceScore, setComplianceScore] = useState(87);
  const [autoCompliance, setAutoCompliance] = useState(true);
  const [gdprEnabled, setGdprEnabled] = useState(true);
  const [ccpaEnabled, setCcpaEnabled] = useState(false);

  const complianceItems: ComplianceItem[] = [
    {
      id: '1',
      name: 'GDPR Compliance',
      status: 'compliant',
      description: 'EU General Data Protection Regulation compliance is active',
      lastChecked: new Date(),
    },
    {
      id: '2', 
      name: 'Opt-in Consent',
      status: 'compliant',
      description: 'All contacts have provided explicit consent for marketing messages',
      lastChecked: new Date(),
    },
    {
      id: '3',
      name: 'Message Frequency Limits',
      status: 'warning',
      description: 'Some campaigns exceed recommended daily message limits',
      lastChecked: new Date(),
      action: 'Adjust campaign frequency'
    },
    {
      id: '4',
      name: 'Data Retention Policy',
      status: 'compliant',
      description: 'Customer data is retained according to policy guidelines',
      lastChecked: new Date(),
    },
    {
      id: '5',
      name: 'WhatsApp Business Policy',
      status: 'violation',
      description: 'Recent campaign may violate WhatsApp business messaging guidelines',
      lastChecked: new Date(),
      action: 'Review campaign content'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'violation':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <CheckCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-success/10 text-success border-success/20';
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'violation':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary flex items-center gap-2">
            <Shield className="w-8 h-8" />
            Compliance Dashboard
          </h1>
          <p className="text-muted-foreground">Monitor and manage regulatory compliance across all campaigns</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="lg">
            <Download className="w-5 h-5 mr-2" />
            Export Report
          </Button>
          <Button variant="default" size="lg">
            <Settings className="w-5 h-5 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Compliance Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-card col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Overall Compliance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold">{complianceScore}%</span>
                  <Badge className={complianceScore >= 90 ? "bg-success text-success-foreground" : 
                                  complianceScore >= 70 ? "bg-warning text-warning-foreground" : 
                                  "bg-destructive text-destructive-foreground"}>
                    {complianceScore >= 90 ? "Excellent" : complianceScore >= 70 ? "Good" : "Needs Attention"}
                  </Badge>
                </div>
                <Progress value={complianceScore} className="h-3" />
                <p className="text-sm text-muted-foreground mt-2">
                  Last updated: {new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Violations</p>
                <p className="text-2xl font-bold text-destructive">1</p>
              </div>
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Warnings</p>
                <p className="text-2xl font-bold text-warning">1</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="regulations">Regulations</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Compliance Items */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceItems.map((item) => (
                  <div key={item.id} className={`p-4 rounded-lg border ${getStatusColor(item.status)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(item.status)}
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="text-sm opacity-80 mt-1">{item.description}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs">
                            <Clock className="w-3 h-3" />
                            <span>Last checked: {item.lastChecked.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      {item.action && (
                        <Button variant="outline" size="sm">
                          {item.action}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regulations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  GDPR (EU)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Enable GDPR Compliance</span>
                  <Switch checked={gdprEnabled} onCheckedChange={setGdprEnabled} />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Consent management active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Right to be forgotten implemented</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Data portability enabled</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  CCPA (California)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Enable CCPA Compliance</span>
                  <Switch checked={ccpaEnabled} onCheckedChange={setCcpaEnabled} />
                </div>
                <div className="space-y-2 text-sm opacity-50">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                    <span>Opt-out mechanisms (disabled)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                    <span>Sale disclosure (disabled)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Compliance Audit Trail</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: "GDPR consent updated", time: "2 hours ago", status: "success" },
                  { action: "WhatsApp policy violation detected", time: "1 day ago", status: "warning" },
                  { action: "Data retention policy applied", time: "2 days ago", status: "success" },
                  { action: "Opt-out request processed", time: "3 days ago", status: "success" },
                  { action: "Campaign compliance check completed", time: "1 week ago", status: "success" }
                ].map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {entry.status === 'success' ? 
                        <CheckCircle className="w-4 h-4 text-success" /> :
                        <AlertTriangle className="w-4 h-4 text-warning" />
                      }
                      <span>{entry.action}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{entry.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Compliance Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Auto-compliance Monitoring</h4>
                  <p className="text-sm text-muted-foreground">Automatically monitor campaigns for compliance violations</p>
                </div>
                <Switch checked={autoCompliance} onCheckedChange={setAutoCompliance} />
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Data Retention Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Customer Data Retention (days)</label>
                    <input className="w-full px-3 py-2 border rounded-md" defaultValue="730" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Campaign Data Retention (days)</label>
                    <input className="w-full px-3 py-2 border rounded-md" defaultValue="365" />
                  </div>
                </div>
              </div>

              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  Compliance settings are encrypted and logged for audit purposes. Changes require administrator approval.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}