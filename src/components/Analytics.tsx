import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Users,
  MessageSquare,
  Heart,
  Download,
  Calendar,
  Filter,
} from "lucide-react";
import analyticsImage from "@/assets/analytics-bg.jpg";

// Mock analytics data
const campaignPerformance = [
  { month: "Jan", sent: 45000, opened: 36000, clicked: 7200, converted: 1440 },
  { month: "Feb", sent: 52000, opened: 41600, clicked: 8320, converted: 1664 },
  { month: "Mar", sent: 48000, opened: 38400, clicked: 7680, converted: 1536 },
  { month: "Apr", sent: 61000, opened: 48800, clicked: 9760, converted: 1952 },
  { month: "May", sent: 55000, opened: 44000, clicked: 8800, converted: 1760 },
  { month: "Jun", sent: 67000, opened: 53600, clicked: 10720, converted: 2144 },
];

const sentimentData = [
  { name: "Positive", value: 68, count: 3400, color: "hsl(var(--success))" },
  { name: "Neutral", value: 22, count: 1100, color: "hsl(var(--muted-foreground))" },
  { name: "Negative", value: 10, count: 500, color: "hsl(var(--danger))" },
];

const customerSegments = [
  { segment: "New Customers", engagement: 85, growth: 12, color: "hsl(var(--primary))" },
  { segment: "Returning", engagement: 92, growth: 8, color: "hsl(var(--success))" },
  { segment: "VIP", engagement: 97, growth: 15, color: "hsl(var(--warning))" },
  { segment: "At Risk", engagement: 45, growth: -5, color: "hsl(var(--danger))" },
];

const hourlyActivity = [
  { hour: "00", messages: 120, responses: 45 },
  { hour: "06", messages: 340, responses: 156 },
  { hour: "09", messages: 890, responses: 445 },
  { hour: "12", messages: 1240, responses: 680 },
  { hour: "15", messages: 1100, responses: 590 },
  { hour: "18", messages: 1450, responses: 780 },
  { hour: "21", messages: 980, responses: 520 },
];

export function Analytics() {
  return (
    <div className="space-y-6">
      {/* Header with Background */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-primary text-primary-foreground">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${analyticsImage})` }}
        />
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Advanced Analytics</h1>
              <p className="text-lg opacity-90">
                Deep insights into campaign performance and customer behavior
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="glass" size="lg">
                <Download className="w-5 h-5 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-card hover:shadow-elegant transition-smooth">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-gradient-success">$284K</p>
                <div className="flex items-center text-xs text-success">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +18.2% vs last month
                </div>
              </div>
              <div className="p-3 bg-success/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-smooth">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response Rate</p>
                <p className="text-2xl font-bold">68.4%</p>
                <div className="flex items-center text-xs text-success">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5.1% improvement
                </div>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-smooth">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Customer Satisfaction</p>
                <p className="text-2xl font-bold text-gradient-success">4.7/5</p>
                <div className="flex items-center text-xs text-success">
                  <Heart className="h-3 w-3 mr-1" />
                  92% positive sentiment
                </div>
              </div>
              <div className="p-3 bg-success/10 rounded-lg">
                <Heart className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-smooth">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Customers</p>
                <p className="text-2xl font-bold">12.3K</p>
                <div className="flex items-center text-xs text-warning">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -2.1% churn rate
                </div>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="timing">Timing</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Campaign Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={campaignPerformance}>
                    <defs>
                      <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Area type="monotone" dataKey="sent" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorSent)" />
                    <Area type="monotone" dataKey="opened" stroke="hsl(var(--success))" fillOpacity={1} fill="url(#colorOpened)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { stage: "Messages Sent", value: 67000, percentage: 100, color: "bg-primary" },
                    { stage: "Messages Opened", value: 53600, percentage: 80, color: "bg-success" },
                    { stage: "Links Clicked", value: 10720, percentage: 16, color: "bg-warning" },
                    { stage: "Conversions", value: 2144, percentage: 3.2, color: "bg-gradient-success" },
                  ].map((stage, index) => (
                    <div key={stage.stage} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{stage.stage}</span>
                        <span className="text-muted-foreground">
                          {stage.value.toLocaleString()} ({stage.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${stage.color} transition-smooth`}
                          style={{ width: `${stage.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Customer Sentiment Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
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

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Sentiment Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sentimentData.map((sentiment) => (
                    <div key={sentiment.name} className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{sentiment.name} Sentiment</span>
                        <Badge 
                          style={{ backgroundColor: sentiment.color }}
                          className="text-white"
                        >
                          {sentiment.value}%
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {sentiment.count.toLocaleString()} customer responses
                      </p>
                      {sentiment.name === "Positive" && (
                        <p className="text-sm text-success mt-1">
                          ↗ Most mentioned: "Great service", "Fast response", "Helpful"
                        </p>
                      )}
                      {sentiment.name === "Negative" && (
                        <p className="text-sm text-danger mt-1">
                          ↘ Main concerns: "Too many messages", "Irrelevant content"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="segments" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Customer Segment Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {customerSegments.map((segment) => (
                  <div key={segment.segment} className="p-6 border border-border rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-lg">{segment.segment}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Growth:</span>
                        <Badge className={
                          segment.growth > 0 ? "bg-success text-success-foreground" : 
                          segment.growth < 0 ? "bg-danger text-danger-foreground" : 
                          "bg-muted text-muted-foreground"
                        }>
                          {segment.growth > 0 ? '+' : ''}{segment.growth}%
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Engagement Rate</span>
                        <span>{segment.engagement}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-smooth"
                          style={{ 
                            width: `${segment.engagement}%`,
                            backgroundColor: segment.color
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timing" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Optimal Send Times
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hourlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="messages" fill="hsl(var(--primary))" name="Messages Sent" />
                  <Bar dataKey="responses" fill="hsl(var(--success))" name="Responses" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}