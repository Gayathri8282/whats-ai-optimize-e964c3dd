import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
} from "recharts";
import {
  TestTube,
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  Activity,
  Zap,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";

// Mock A/B test data
const abTests = [
  {
    id: 1,
    name: "Welcome Message Variants",
    status: "running",
    campaign: "Welcome Series",
    variants: [
      { name: "A", performance: 15.2, allocation: 25, conversions: 152 },
      { name: "B", performance: 18.7, allocation: 45, conversions: 234 },
      { name: "C", performance: 12.8, allocation: 20, conversions: 89 },
      { name: "D", performance: 16.3, allocation: 10, conversions: 67 },
    ],
    rl_algorithm: "Thompson Sampling",
    confidence: 95,
    duration: 7,
    audience: 5000,
  },
  {
    id: 2,
    name: "CTA Button Text",
    status: "completed",
    campaign: "Summer Sale",
    variants: [
      { name: "A", performance: 22.1, allocation: 50, conversions: 441 },
      { name: "B", performance: 19.8, allocation: 50, conversions: 396 },
    ],
    rl_algorithm: "UCB",
    confidence: 98,
    duration: 14,
    audience: 4000,
  },
];

const performanceData = [
  { day: "Day 1", variantA: 12, variantB: 15, variantC: 11, variantD: 13 },
  { day: "Day 2", variantA: 14, variantB: 16, variantC: 12, variantD: 14 },
  { day: "Day 3", variantA: 15, variantB: 18, variantC: 13, variantD: 15 },
  { day: "Day 4", variantA: 15, variantB: 19, variantC: 13, variantD: 16 },
  { day: "Day 5", variantA: 15, variantB: 19, variantC: 12, variantD: 16 },
  { day: "Day 6", variantA: 15, variantB: 18, variantC: 13, variantD: 17 },
  { day: "Day 7", variantA: 15, variantB: 19, variantC: 13, variantD: 16 },
];

export function ABTesting() {
  const [selectedTest, setSelectedTest] = useState(abTests[0]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "bg-success text-success-foreground";
      case "completed": return "bg-primary text-primary-foreground";
      case "paused": return "bg-warning text-warning-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getBestVariant = (variants: any[]) => {
    return variants.reduce((best, current) => 
      current.performance > best.performance ? current : best
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary">A/B Testing Dashboard</h1>
          <p className="text-muted-foreground">Reinforcement learning-powered optimization</p>
        </div>
        <Button variant="hero" size="lg" className="gap-2">
          <TestTube className="w-5 h-5" />
          Create A/B Test
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Tests</p>
                <p className="text-2xl font-bold">
                  {abTests.filter(t => t.status === 'running').length}
                </p>
              </div>
              <TestTube className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Audience</p>
                <p className="text-2xl font-bold">
                  {abTests.reduce((sum, t) => sum + t.audience, 0).toLocaleString()}
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
                <p className="text-sm text-muted-foreground">Avg Lift</p>
                <p className="text-2xl font-bold text-gradient-success">+23%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confidence</p>
                <p className="text-2xl font-bold">95%</p>
              </div>
              <Target className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test List */}
        <Card className="shadow-card lg:col-span-1">
          <CardHeader>
            <CardTitle>Active A/B Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {abTests.map((test) => (
                <div
                  key={test.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-smooth hover:shadow-card ${
                    selectedTest.id === test.id ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                  onClick={() => setSelectedTest(test)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{test.name}</h4>
                    <Badge className={getStatusColor(test.status)}>
                      {test.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{test.campaign}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <Brain className="w-3 h-3" />
                    <span>{test.rl_algorithm}</span>
                  </div>
                  <div className="mt-2 text-xs">
                    <div className="flex justify-between">
                      <span>Best variant: {getBestVariant(test.variants).name}</span>
                      <span>{getBestVariant(test.variants).performance}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Test Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="w-5 h-5" />
                  {selectedTest.name}
                </CardTitle>
                <div className="flex gap-2">
                  {selectedTest.status === "running" && (
                    <>
                      <Button variant="ghost" size="sm">
                        <Pause className="w-4 h-4 mr-1" />
                        Pause
                      </Button>
                      <Button variant="ghost" size="sm">
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Reset
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Test Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold">{selectedTest.duration} days</div>
                    <div className="text-sm text-muted-foreground">Duration</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{selectedTest.audience.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Audience</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{selectedTest.confidence}%</div>
                    <div className="text-sm text-muted-foreground">Confidence</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{selectedTest.rl_algorithm}</div>
                    <div className="text-sm text-muted-foreground">Algorithm</div>
                  </div>
                </div>

                {/* Variant Performance */}
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    Variant Performance & Traffic Allocation
                  </h4>
                  {selectedTest.variants.map((variant, index) => {
                    const isWinner = variant === getBestVariant(selectedTest.variants);
                    return (
                      <div key={variant.name} className="p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">
                              Variant {variant.name}
                            </Badge>
                            {isWinner && (
                              <Badge className="bg-gradient-success text-success-foreground">
                                Winner
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{variant.performance}%</div>
                            <div className="text-sm text-muted-foreground">
                              {variant.conversions} conversions
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Performance</span>
                            <span>{variant.performance}%</span>
                          </div>
                          <Progress value={variant.performance} className="h-2" />
                          <div className="flex justify-between text-sm">
                            <span>Traffic Allocation</span>
                            <span>{variant.allocation}%</span>
                          </div>
                          <Progress value={variant.allocation} className="h-2" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* RL Insights */}
                <div className="p-4 bg-gradient-card rounded-lg border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-5 h-5 text-primary" />
                    <span className="font-medium">Reinforcement Learning Insights</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p>• Variant B shows 23% higher performance - increasing allocation to 45%</p>
                    <p>• Thompson Sampling is exploring variants C and D for potential improvements</p>
                    <p>• Regret minimization strategy suggests continuing test for 3 more days</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Chart */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Performance Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="variantA" stroke="hsl(var(--primary))" name="Variant A" />
                  <Line type="monotone" dataKey="variantB" stroke="hsl(var(--success))" name="Variant B" />
                  <Line type="monotone" dataKey="variantC" stroke="hsl(var(--warning))" name="Variant C" />
                  <Line type="monotone" dataKey="variantD" stroke="hsl(var(--danger))" name="Variant D" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}