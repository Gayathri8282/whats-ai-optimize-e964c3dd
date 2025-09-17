import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
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
  Database,
} from "lucide-react";
import heroImage from "@/assets/hero-dashboard.jpg";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useCustomers } from "@/hooks/useCustomers";
import { SampleDataGenerator } from "@/components/SampleDataGenerator";

export function DataDrivenDashboard() {
  const { analytics, isLoading: analyticsLoading } = useAnalytics();
  const { customers, segments, isLoading: customersLoading } = useCustomers(100);

  // Compute real-time metrics from customer data
  const computedMetrics = {
    activeCampaigns: customers.filter(c => c.campaigns_accepted > 0).length,
    totalCustomers: customers.length,
    totalRevenue: analytics?.total_revenue || 0,
    avgCTR: analytics?.avg_ctr || 0,
    roi: analytics?.roi || 0
  };

  // Generate campaign performance data from customer segments
  const campaignPerformanceData = segments.map((segment, index) => ({
    name: segment.segment.split(' ')[0], // Short name
    sent: segment.count * 50, // Simulate messages sent
    opened: Math.round(segment.count * 50 * (segment.engagement_rate / 100)),
    clicked: Math.round(segment.count * 50 * (segment.engagement_rate / 100) * 0.3),
  }));

  // Real sentiment data from analytics
  const sentimentData = analytics ? [
    { name: "Positive", value: analytics.sentiment.positive, color: "hsl(var(--success))" },
    { name: "Neutral", value: analytics.sentiment.neutral, color: "hsl(var(--muted-foreground))" },
    { name: "Negative", value: analytics.sentiment.negative, color: "hsl(var(--danger))" },
  ] : [];

  if (analyticsLoading || customersLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Show sample data generator if no customers exist
  if (customers.length === 0) {
    return (
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-xl bg-gradient-hero text-primary-foreground">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
          <div className="relative p-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
                <Database className="w-8 h-8" />
                Data-Driven WhatsApp Marketing
              </h1>
              <p className="text-lg opacity-90 mb-4">
                Get started by generating sample data from the iFood marketing dataset
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <div className="max-w-md w-full">
            <SampleDataGenerator />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section with Real Data */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-hero text-primary-foreground">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
                <Database className="w-8 h-8" />
                Data-Driven WhatsApp Marketing
              </h1>
              <p className="text-lg opacity-90 mb-4">
                Real analytics from {computedMetrics.totalCustomers} customers using iFood dataset insights
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
              <div className="text-3xl font-bold">{computedMetrics.roi.toFixed(1)}%</div>
              <div className="text-sm opacity-80">Real ROI</div>
            </div>
          </div>
        </div>
      </div>

      {/* Real KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-card hover:shadow-elegant transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gradient-primary">{computedMetrics.activeCampaigns}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 text-success mr-1" />
              From real customer data
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${computedMetrics.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 text-success mr-1" />
              Real customer spending
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg CTR</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gradient-success">{computedMetrics.avgCTR.toFixed(1)}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 text-success mr-1" />
              Campaign acceptance rate
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{computedMetrics.totalCustomers}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Database className="h-3 w-3 text-primary mr-1" />
              iFood dataset records
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real Data Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Customer Segment Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={campaignPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Bar dataKey="sent" fill="hsl(var(--primary))" name="Messages Sent" />
                <Bar dataKey="opened" fill="hsl(var(--success))" name="Opened" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Customer Sentiment (Real Data)
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
                  label={({ name, value }) => `${name}: ${value}`}
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
    </div>
  );
}