import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Play,
  Pause,
  Trophy,
  Target,
  TrendingUp,
  Split,
  BarChart3,
  Eye,
  MousePointer,
} from "lucide-react";

interface ABTest {
  id: string;
  campaign_id: string;
  name: string;
  status: string;
  traffic_split: number;
  winner_variation: string | null;
  confidence_level: number | null;
  created_at: string;
  variations?: ABTestVariation[];
}

interface ABTestVariation {
  id: string;
  ab_test_id: string;
  variation_name: string;
  message_template: string;
  audience_count: number;
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  conversion_count: number;
  ctr: number;
  conversion_rate: number;
}

interface Campaign {
  id: string;
  name: string;
  message_template: string;
}

export function ABTestManager() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [abTests, setAbTests] = useState<ABTest[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    campaign_id: "",
    traffic_split: 50,
    variation_a: "",
    variation_b: ""
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchData();
        } else {
          setAbTests([]);
          setCampaigns([]);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchData();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Auto-refresh for real-time test every 10 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchRealtimeTest();
    }, 10000);

    return () => clearInterval(interval);
  }, [user]);

  const fetchRealTimeMetrics = async (variationId: string) => {
    try {
      const [clicksResult, visitsResult] = await Promise.all([
        supabase
          .from('click_events')
          .select('*', { count: 'exact', head: true })
          .eq('variation_id', variationId),
        supabase
          .from('page_visits')
          .select('*', { count: 'exact', head: true })
          .eq('variation_id', variationId)
      ]);

      const clickedCount = clicksResult.count || 0;
      const openedCount = visitsResult.count || 0;
      const ctr = openedCount > 0 ? ((clickedCount / openedCount) * 100) : 0;

      return { clickedCount, openedCount, ctr };
    } catch (error) {
      console.error('Error fetching real-time metrics:', error);
      return { clickedCount: 0, openedCount: 0, ctr: 0 };
    }
  };

  const fetchRealtimeTest = async () => {
    try {
      // Fetch the latest test (most recently created)
      const { data: testData, error: testError } = await supabase
        .from('ab_tests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (testError || !testData) return;

      // Fetch all variations for this test
      const { data: variationsData } = await supabase
        .from('ab_test_variations')
        .select('*')
        .eq('ab_test_id', testData.id);

      const variationsWithMetrics = await Promise.all(
        (variationsData || []).map(async (variation) => {
          const metrics = await fetchRealTimeMetrics(variation.id);
          return {
            ...variation,
            clicked_count: metrics.clickedCount,
            opened_count: metrics.openedCount,
            ctr: metrics.ctr,
            sent_count: 0,
            conversion_count: 0
          };
        })
      );

      const formattedTest: ABTest = {
        ...testData,
        variations: variationsWithMetrics
      };

      setAbTests(prev => {
        // Remove any existing instance of this test and add updated version at top
        const withoutCurrent = prev.filter(t => t.id !== testData.id);
        return [formattedTest, ...withoutCurrent];
      });
    } catch (error) {
      console.error('Error fetching latest test:', error);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch campaigns
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select('id, name, message_template')
        .order('created_at', { ascending: false });
      
      if (campaignsError) throw campaignsError;
      setCampaigns(campaignsData || []);

      // Fetch all A/B tests
      const { data: abTestsData, error: abTestsError } = await supabase
        .from('ab_tests')
        .select(`
          id,
          campaign_id,
          name,
          status,
          traffic_split,
          winner_variation,
          confidence_level,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });
      
      if (abTestsError) throw abTestsError;
      
      // Fetch variations separately for each test
      const testsWithVariations = await Promise.all(
        (abTestsData || []).map(async (test) => {
          const { data: variations } = await supabase
            .from('ab_test_variations')
            .select('*')
            .eq('ab_test_id', test.id);
          
          return {
            ...test,
            variations: variations || []
          };
        })
      );
      
      setAbTests(testsWithVariations as ABTest[]);
      
      // Fetch and update metrics for the latest test
      await fetchRealtimeTest();
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load A/B tests",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateABTest = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create A/B tests",
        variant: "destructive"
      });
      return;
    }

    if (!formData.name || !formData.campaign_id || !formData.variation_a || !formData.variation_b) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create A/B test
      const { data: abTestData, error: abTestError } = await supabase
        .from('ab_tests')
        .insert({
          campaign_id: formData.campaign_id,
          name: formData.name,
          traffic_split: formData.traffic_split,
          status: 'draft'
        })
        .select()
        .single();

      if (abTestError) throw abTestError;

      // Create variations
      const variationsData = [
        {
          ab_test_id: abTestData.id,
          variation_name: 'A',
          message_template: formData.variation_a,
          audience_count: Math.floor(Math.random() * 5000) + 1000
        },
        {
          ab_test_id: abTestData.id,
          variation_name: 'B',
          message_template: formData.variation_b,
          audience_count: Math.floor(Math.random() * 5000) + 1000
        }
      ];

      const { error: variationsError } = await supabase
        .from('ab_test_variations')
        .insert(variationsData);

      if (variationsError) throw variationsError;

      toast({
        title: "Success",
        description: "A/B test created successfully!",
        variant: "default"
      });

      setShowCreateDialog(false);
      setFormData({
        name: "",
        campaign_id: "",
        traffic_split: 50,
        variation_a: "",
        variation_b: ""
      });
      fetchData();
    } catch (error) {
      console.error('Error creating A/B test:', error);
      toast({
        title: "Error",
        description: "Failed to create A/B test",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startABTest = async (testId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('start-ab-test', {
        body: { testId }
      });

      if (error) throw error;

      toast({
        title: "A/B Test Started",
        description: "Your A/B test is now running!",
        variant: "default"
      });

      fetchData();
    } catch (error) {
      console.error('Error starting A/B test:', error);
      toast({
        title: "Error",
        description: "Failed to start A/B test",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stopABTest = async (testId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('ab_tests')
        .update({ status: 'stopped' })
        .eq('id', testId);

      if (error) throw error;

      toast({
        title: "A/B Test Stopped",
        description: "Your A/B test has been stopped",
        variant: "default"
      });

      fetchData();
    } catch (error) {
      console.error('Error stopping A/B test:', error);
      toast({
        title: "Error",
        description: "Failed to stop A/B test",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "bg-success text-success-foreground";
      case "stopped": return "bg-warning text-warning-foreground";
      case "completed": return "bg-primary text-primary-foreground";
      case "draft": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getWinnerBadge = (variation: ABTestVariation, test: ABTest) => {
    if (test.winner_variation === variation.variation_name) {
      return (
        <Badge className="bg-gradient-success text-success-foreground ml-2">
          <Trophy className="w-3 h-3 mr-1" />
          Winner
        </Badge>
      );
    }
    return null;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-muted-foreground mb-4">Please sign in to access A/B testing</p>
          <Button onClick={() => window.location.href = '/auth'}>
            Go to Sign In
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary">A/B Testing</h1>
          <p className="text-muted-foreground">Test and optimize your campaign messages</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button variant="hero" size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              Create A/B Test
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Split className="w-5 h-5 text-primary" />
                Create A/B Test
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="test-name">Test Name</Label>
                  <Input 
                    id="test-name" 
                    placeholder="Enter test name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaign">Campaign</Label>
                  <Select value={formData.campaign_id} onValueChange={(value) => setFormData(prev => ({ ...prev, campaign_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select campaign" />
                    </SelectTrigger>
                    <SelectContent>
                      {campaigns.map((campaign) => (
                        <SelectItem key={campaign.id} value={campaign.id}>
                          {campaign.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Traffic Split: {formData.traffic_split}% / {100 - formData.traffic_split}%</Label>
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="10"
                  value={formData.traffic_split}
                  onChange={(e) => setFormData(prev => ({ ...prev, traffic_split: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="variation-a">Variation A</Label>
                  <Textarea
                    id="variation-a"
                    placeholder="Enter message template for variation A..."
                    rows={3}
                    value={formData.variation_a}
                    onChange={(e) => setFormData(prev => ({ ...prev, variation_a: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="variation-b">Variation B</Label>
                  <Textarea
                    id="variation-b"
                    placeholder="Enter message template for variation B..."
                    rows={3}
                    value={formData.variation_b}
                    onChange={(e) => setFormData(prev => ({ ...prev, variation_b: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button variant="ghost" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button variant="success" onClick={handleCreateABTest} disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create A/B Test"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* A/B Tests List */}
      <div className="space-y-4">
        {abTests.map((test) => (
          <Card key={test.id} className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <CardTitle>{test.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(test.status)}>
                        {test.status}
                      </Badge>
                      <Badge variant="outline">
                        Split: {test.traffic_split}% / {100 - test.traffic_split}%
                      </Badge>
                      {test.confidence_level && (
                        <Badge className="bg-gradient-primary text-primary-foreground">
                          {Math.round(test.confidence_level)}% confidence
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {test.status === "draft" && (
                    <Button variant="ghost" size="icon" onClick={() => startABTest(test.id)}>
                      <Play className="w-4 h-4" />
                    </Button>
                  )}
                  {test.status === "running" && (
                    <Button variant="ghost" size="icon" onClick={() => stopABTest(test.id)}>
                      <Pause className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {test.variations?.map((variation) => (
                  <div key={variation.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        Variation {variation.variation_name}
                        {getWinnerBadge(variation, test)}
                      </h4>
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-4 p-3 bg-muted rounded">
                      {variation.message_template}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground">
                          <Target className="w-3 h-3" />
                          Audience
                        </div>
                        <div className="font-bold">{variation.audience_count?.toLocaleString() || 0}</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground">
                          <Eye className="w-3 h-3" />
                          Opened
                        </div>
                        <div className="font-bold">{variation.opened_count?.toLocaleString() || 0}</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground">
                          <MousePointer className="w-3 h-3" />
                          Clicked
                        </div>
                        <div className="font-bold">{variation.clicked_count?.toLocaleString() || 0}</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground">
                          <TrendingUp className="w-3 h-3" />
                          CTR
                        </div>
                        <div className="font-bold text-gradient-success">{variation.ctr || 0}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}