import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  MessageSquare,
  Users,
  Target,
  Activity,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Brain,
} from "lucide-react";
import heroImage from "@/assets/hero-dashboard.jpg";

// Mock data for charts
const campaignData = [
  { name: "Mon", sent: 1200, opened: 960, clicked: 240 },
  { name: "Tue", sent: 1400, opened: 1120, clicked: 280 },
  { name: "Wed", sent: 1100, opened: 880, clicked: 220 },
  { name: "Thu", sent: 1600, opened: 1280, clicked: 320 },
  { name: "Fri", sent: 1800, opened: 1440, clicked: 360 },
  { name: "Sat", sent: 1300, opened: 1040, clicked: 260 },
  { name: "Sun", sent: 1000, opened: 800, clicked: 200 },
];

const sentimentData = [
  { name: "Positive", value: 65, color: "hsl(var(--success))" },
  { name: "Neutral", value: 25, color: "hsl(var(--muted-foreground))" },
  { name: "Negative", value: 10, color: "hsl(var(--danger))" },
];

const abTestData = [
  { variant: "A", performance: 85, allocation: 40 },
  { variant: "B", performance: 92, allocation: 45 },
  { variant: "C", performance: 78, allocation: 15 },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-hero text-primary-foreground">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">AI-Powered WhatsApp Marketing</h1>
              <p className="text-lg opacity-90 mb-4">
                Reinforcement learning meets personalized messaging
              </p>
              <div className="flex gap-3">
                <Button variant="glass" size="lg" className="font-semibold">
                  <Brain className="w-5 h-5 mr-2" />
                  Create AI Campaign
                </Button>
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                  View Analytics
                </Button>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">99.2%</div>
              <div className="text-sm opacity-80">System Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-card hover:shadow-elegant transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gradient-primary">24</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 text-success mr-1" />
              +12% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
            <MessageSquare className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2M</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 text-success mr-1" />
              +8.4% this week
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Click Rate</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gradient-success">18.7%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 text-success mr-1" />
              +2.3% vs industry avg
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gradient-success">$4.2M</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 text-success mr-1" />
              +15.2% QoQ growth
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Performance */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Campaign Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={campaignData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="sent" fill="hsl(var(--primary))" name="Sent" />
                <Bar dataKey="opened" fill="hsl(var(--success))" name="Opened" />
                <Bar dataKey="clicked" fill="hsl(var(--warning))" name="Clicked" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sentiment Analysis */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Sentiment Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* A/B Testing Results */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Active A/B Tests - Reinforcement Learning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {abTestData.map((variant) => (
              <div key={variant.variant} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="font-mono">
                    Variant {variant.variant}
                  </Badge>
                  <div>
                    <div className="font-medium">Performance: {variant.performance}%</div>
                    <div className="text-sm text-muted-foreground">
                      Traffic Allocation: {variant.allocation}%
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Progress value={variant.performance} className="w-32" />
                  <Button variant="ghost" size="sm">
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-gradient-card rounded-lg border border-border/50">
            <div className="flex items-center gap-2 text-sm text-primary font-medium">
              <Brain className="w-4 h-4" />
              AI Recommendation: Variant B showing 8% higher conversion. Auto-adjusting traffic allocation.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: "Campaign 'Summer Sale' created", time: "2 minutes ago", type: "success" },
              { action: "A/B test completed for 'Welcome Series'", time: "15 minutes ago", type: "info" },
              { action: "Customer opt-out processed", time: "32 minutes ago", type: "warning" },
              { action: "Performance threshold exceeded", time: "1 hour ago", type: "success" },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === "success" ? "bg-success" : 
                    activity.type === "warning" ? "bg-warning" : "bg-primary"
                  }`} />
                  <span className="text-sm">{activity.action}</span>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}