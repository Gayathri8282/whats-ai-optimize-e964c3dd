import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Edit,
  Play,
  Pause,
  Trash2,
  Brain,
  Users,
  MessageSquare,
  TrendingUp,
  Calendar,
  Target,
} from "lucide-react";

// Mock campaigns data
const campaigns = [
  {
    id: 1,
    name: "Summer Sale 2024",
    status: "active",
    type: "promotional",
    audience: 15420,
    sent: 12336,
    opened: 9869,
    clicked: 1974,
    ctr: 19.8,
    created: "2024-03-15",
    ai_optimization: true,
  },
  {
    id: 2,
    name: "Welcome Series",
    status: "paused",
    type: "onboarding",
    audience: 8930,
    sent: 7144,
    opened: 5572,
    clicked: 1114,
    ctr: 15.6,
    created: "2024-03-10",
    ai_optimization: true,
  },
  {
    id: 3,
    name: "Product Launch",
    status: "draft",
    type: "announcement",
    audience: 22100,
    sent: 0,
    opened: 0,
    clicked: 0,
    ctr: 0,
    created: "2024-03-20",
    ai_optimization: false,
  },
];

export function CampaignManager() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success text-success-foreground";
      case "paused": return "bg-warning text-warning-foreground";
      case "draft": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary">Campaign Management</h1>
          <p className="text-muted-foreground">Create and manage your AI-powered WhatsApp campaigns</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button variant="hero" size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                Create AI-Powered Campaign
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="campaign-name">Campaign Name</Label>
                  <Input id="campaign-name" placeholder="Enter campaign name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaign-type">Campaign Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="promotional">Promotional</SelectItem>
                      <SelectItem value="onboarding">Onboarding</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="survey">Survey</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message-template">Message Template</Label>
                <Textarea
                  id="message-template"
                  placeholder="Enter your message template..."
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Brain className="w-4 h-4 mr-1" />
                    AI Suggestions
                  </Button>
                  <Button variant="outline" size="sm">
                    Load Template
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="audience">Target Audience</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Customers</SelectItem>
                      <SelectItem value="new">New Customers</SelectItem>
                      <SelectItem value="returning">Returning Customers</SelectItem>
                      <SelectItem value="vip">VIP Customers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule">Schedule</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Send now or schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="now">Send Now</SelectItem>
                      <SelectItem value="schedule">Schedule Later</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-4 bg-gradient-card rounded-lg border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-primary" />
                  <span className="font-medium">AI Optimization Settings</span>
                </div>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    Enable reinforcement learning optimization
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    Auto A/B test message variations
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    Personalize content using RAG
                  </label>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button variant="ghost" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button variant="success">
                  Create Campaign
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Campaigns</p>
                <p className="text-2xl font-bold">{campaigns.length}</p>
              </div>
              <Target className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-success">
                  {campaigns.filter(c => c.status === 'active').length}
                </p>
              </div>
              <Play className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Audience</p>
                <p className="text-2xl font-bold">
                  {campaigns.reduce((sum, c) => sum + c.audience, 0).toLocaleString()}
                </p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg CTR</p>
                <p className="text-2xl font-bold text-gradient-success">
                  {(campaigns.reduce((sum, c) => sum + c.ctr, 0) / campaigns.length).toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Your Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="p-6 border border-border rounded-lg hover:shadow-card transition-smooth">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-semibold text-lg">{campaign.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                        <Badge variant="outline">{campaign.type}</Badge>
                        {campaign.ai_optimization && (
                          <Badge className="bg-gradient-primary text-primary-foreground">
                            <Brain className="w-3 h-3 mr-1" />
                            AI Optimized
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="w-4 h-4" />
                    </Button>
                    {campaign.status === "active" ? (
                      <Button variant="ghost" size="icon">
                        <Pause className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="icon">
                        <Play className="w-4 h-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon">
                      <Trash2 className="w-4 h-4 text-danger" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{campaign.audience.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Audience</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{campaign.sent.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Sent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{campaign.opened.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Opened</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{campaign.clicked.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Clicked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gradient-success">{campaign.ctr}%</div>
                    <div className="text-sm text-muted-foreground">CTR</div>
                  </div>
                </div>

                {campaign.status === "active" && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Campaign Progress</span>
                      <span>{Math.round((campaign.sent / campaign.audience) * 100)}%</span>
                    </div>
                    <Progress value={(campaign.sent / campaign.audience) * 100} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}