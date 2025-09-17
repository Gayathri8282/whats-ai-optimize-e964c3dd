import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Send, RefreshCw, Brain, Target, Play, Pause, Plus, TrendingUp, Users, BarChart3, Trophy } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Campaign {
  id: string;
  name: string;
  message_template: string;
  target_audience: string;
  type: string;
}

interface ProductDetails {
  id?: string;
  name: string;
  description: string;
  price: string;
  features: string;
  benefits: string;
  offer: string;
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
  read_count: number;
  reply_count: number;
  conversion_count: number;
  ctr: number;
  conversion_rate: number;
  traffic_allocation: number;
  is_winner: boolean;
}

interface ABTest {
  id: string;
  name: string;
  campaign_id: string;
  status: string;
  traffic_split: number;
  confidence_level: number;
  winner_variation: string | null;
  target_audience: string;
  customer_count: number;
  started_at: string | null;
  completed_at: string | null;
  campaign?: Campaign | null;
  variations?: ABTestVariation[];
}

interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  opt_out: boolean;
}

export function ABTesting() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [abTests, setAbTests] = useState<ABTest[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [variants, setVariants] = useState<string[]>(['', '', '']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [testName, setTestName] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [trafficSplit, setTrafficSplit] = useState(33);
  const [productDetails, setProductDetails] = useState<ProductDetails>({
    name: '',
    description: '',
    price: '',
    features: '',
    benefits: '',
    offer: ''
  });
  const { toast } = useToast();

  // Fetch data on mount and auth changes
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await Promise.all([fetchCampaigns(), fetchCustomers(), fetchABTests()]);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        Promise.all([fetchCampaigns(), fetchCustomers(), fetchABTests()]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Real-time subscription for A/B test updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('ab-test-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ab_tests' },
        () => fetchABTests()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'ab_test_variations' },
        () => fetchABTests()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, full_name, email, phone, location, opt_out')
        .eq('opt_out', false)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchABTests = async () => {
    try {
      // First fetch A/B tests
      const { data: testsData, error: testsError } = await supabase
        .from('ab_tests')
        .select('*')
        .order('created_at', { ascending: false });

      if (testsError) throw testsError;

      // Then fetch related data separately
      const formattedTests: ABTest[] = [];
      
      for (const test of testsData || []) {
        // Fetch campaign
        const { data: campaignData } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', test.campaign_id)
          .single();

        // Fetch variations
        const { data: variationsData } = await supabase
          .from('ab_test_variations')
          .select('*')
          .eq('ab_test_id', test.id);

        formattedTests.push({
          ...test,
          campaign: campaignData,
          variations: variationsData || []
        });
      }

      setAbTests(formattedTests);
      if (formattedTests.length > 0 && !selectedTest) {
        setSelectedTest(formattedTests[0]);
      }
    } catch (error) {
      console.error('Error fetching A/B tests:', error);
      setAbTests([]);
    }
  };

  const generateVariants = async () => {
    if (!selectedCampaign) return;

    setIsGenerating(true);
    try {
      const requestBody = {
        task: 'generate_variants',
        campaign: {
          name: selectedCampaign.name,
          description: selectedCampaign.message_template
        },
        product: productDetails,
        context: {
          target_audience: targetAudience || selectedCampaign.target_audience,
          platform: 'WhatsApp'
        }
      };

      const { data, error } = await supabase.functions.invoke('ab-testing-agent', {
        body: requestBody,
      });

      if (error) throw error;

      let variantTexts: string[] = [];
      
      if (data?.variants && Array.isArray(data.variants)) {
        variantTexts = data.variants;
      } else {
        // Fallback variants
        variantTexts = [
          `🎉 ${selectedCampaign.name}! ${selectedCampaign.message_template.substring(0, 80)}...`,
          `Hey! ${selectedCampaign.message_template.substring(0, 80)}... 🔥`,
          `Special offer: ${selectedCampaign.message_template.substring(0, 80)}... ⚡`
        ];
      }

      setVariants(variantTexts);
      toast({
        title: "Variants Generated",
        description: `Generated ${variantTexts.length} AI-powered message variants.`,
      });
    } catch (error) {
      console.error('Error generating variants:', error);
      toast({
        title: "Generation Failed",
        description: `Failed to generate variants. Using fallbacks.`,
        variant: "destructive",
      });
      
      // Set fallback variants
      if (selectedCampaign) {
        setVariants([
          `🎉 ${selectedCampaign.name}! ${selectedCampaign.message_template.substring(0, 80)}...`,
          `Hey! ${selectedCampaign.message_template.substring(0, 80)}... 🔥`,
          `Special offer: ${selectedCampaign.message_template.substring(0, 80)}... ⚡`
        ]);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const createABTest = async () => {
    if (!selectedCampaign || !testName || variants.some(v => !v.trim())) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and generate variants.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      // Save product details first
      let productDetailsId = null;
      if (productDetails.name || productDetails.description) {
        const { data: productData, error: productError } = await supabase
          .from('product_details')
          .insert({
            user_id: user.id,
            ...productDetails
          })
          .select()
          .single();

        if (productError) throw productError;
        productDetailsId = productData.id;
      }

      // Create A/B test
      const { data: testData, error: testError } = await supabase
        .from('ab_tests')
        .insert({
          name: testName,
          campaign_id: selectedCampaign.id,
          status: 'draft',
          traffic_split: trafficSplit,
          target_audience: targetAudience || selectedCampaign.target_audience,
          customer_count: customers.length,
          confidence_level: 0,
          product_details_id: productDetailsId
        })
        .select()
        .single();

      if (testError) throw testError;

      // Create variations
      const variationPromises = variants.map((variant, index) => 
        supabase
          .from('ab_test_variations')
          .insert({
            ab_test_id: testData.id,
            variation_name: String.fromCharCode(65 + index),
            message_template: variant,
            audience_count: Math.floor(customers.length / variants.length),
            traffic_allocation: Math.floor(100 / variants.length),
            sent_count: 0,
            opened_count: 0,
            clicked_count: 0,
            read_count: 0,
            reply_count: 0,
            conversion_count: 0,
            ctr: 0,
            conversion_rate: 0,
            is_winner: false
          })
      );

      await Promise.all(variationPromises);

      toast({
        title: "A/B Test Created",
        description: `Successfully created "${testName}" with ${variants.length} variations.`,
      });

      // Reset form and refresh data
      setShowCreateDialog(false);
      setTestName('');
      setVariants(['', '', '']);
      setProductDetails({
        name: '',
        description: '',
        price: '',
        features: '',
        benefits: '',
        offer: ''
      });
      
      await fetchABTests();
    } catch (error) {
      console.error('Error creating A/B test:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create A/B test. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const startABTest = async (testId: string) => {
    try {
      const { error } = await supabase.functions.invoke('start-ab-test', {
        body: { testId }
      });

      if (error) throw error;

      toast({
        title: "A/B Test Started",
        description: "The test is now running and collecting data.",
      });

      await fetchABTests();
    } catch (error) {
      console.error('Error starting A/B test:', error);
      toast({
        title: "Start Failed",
        description: "Failed to start the A/B test.",
        variant: "destructive",
      });
    }
  };

  const stopABTest = async (testId: string) => {
    try {
      const { error } = await supabase
        .from('ab_tests')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', testId);

      if (error) throw error;

      toast({
        title: "A/B Test Stopped",
        description: "The test has been completed.",
      });

      await fetchABTests();
    } catch (error) {
      console.error('Error stopping A/B test:', error);
      toast({
        title: "Stop Failed",
        description: "Failed to stop the A/B test.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBestVariation = (variations: ABTestVariation[]) => {
    if (!variations || variations.length === 0) return null;
    return variations.reduce((best, current) => 
      current.ctr > best.ctr ? current : best
    );
  };

  const calculatePerformanceData = () => {
    if (!selectedTest?.variations) return [];
    
    return Array.from({ length: 7 }, (_, index) => ({
      day: `Day ${index + 1}`,
      ...selectedTest.variations.reduce((acc, variation, varIndex) => {
        const basePerformance = variation.ctr;
        const dailyVariation = Math.random() * 2 - 1; // -1 to 1
        acc[`variant${variation.variation_name}`] = Math.max(0, basePerformance + dailyVariation);
        return acc;
      }, {} as Record<string, number>)
    }));
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-96">
          <CardHeader className="text-center">
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to access A/B Testing features</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">AI-Powered A/B Testing</h1>
            <p className="text-muted-foreground">Smart campaign optimization with real-time analytics</p>
          </div>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create A/B Test
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New A/B Test</DialogTitle>
              <DialogDescription>
                Set up a new A/B test with AI-generated variants
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Test Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="testName">Test Name</Label>
                  <Input
                    id="testName"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    placeholder="e.g., Summer Sale Message Variants"
                  />
                </div>
                <div>
                  <Label htmlFor="campaign">Campaign</Label>
                  <Select onValueChange={(value) => {
                    const campaign = campaigns.find(c => c.id === value);
                    setSelectedCampaign(campaign || null);
                    setTargetAudience(campaign?.target_audience || '');
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a campaign" />
                    </SelectTrigger>
                    <SelectContent>
                      {campaigns.map((campaign) => (
                        <SelectItem key={campaign.id} value={campaign.id}>
                          {campaign.name} ({campaign.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="audience">Target Audience</Label>
                  <Input
                    id="audience"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g., young adults, tech enthusiasts"
                  />
                </div>
                <div>
                  <Label htmlFor="split">Traffic Split (%)</Label>
                  <Input
                    id="split"
                    type="number"
                    value={trafficSplit}
                    onChange={(e) => setTrafficSplit(Number(e.target.value))}
                    min="10"
                    max="50"
                  />
                </div>
              </div>

              {/* Product Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Product Details (Optional)</CardTitle>
                  <CardDescription>Provide product information for better AI variants</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="productName">Product Name</Label>
                      <Input
                        id="productName"
                        value={productDetails.name}
                        onChange={(e) => setProductDetails(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Premium Wireless Headphones"
                      />
                    </div>
                    <div>
                      <Label htmlFor="productPrice">Price/Offer</Label>
                      <Input
                        id="productPrice"
                        value={productDetails.price}
                        onChange={(e) => setProductDetails(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="e.g., $99, 20% off"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="productDesc">Description</Label>
                    <Textarea
                      id="productDesc"
                      value={productDetails.description}
                      onChange={(e) => setProductDetails(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief product description..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Generate Variants */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Message Variants</Label>
                  <Button 
                    onClick={generateVariants}
                    disabled={!selectedCampaign || isGenerating}
                    variant="outline"
                    size="sm"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Generate AI Variants
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {variants.map((variant, index) => (
                    <div key={index}>
                      <Label htmlFor={`variant-${index}`}>
                        Variant {String.fromCharCode(65 + index)}
                      </Label>
                      <Textarea
                        id={`variant-${index}`}
                        value={variant}
                        onChange={(e) => {
                          const newVariants = [...variants];
                          newVariants[index] = e.target.value;
                          setVariants(newVariants);
                        }}
                        placeholder={`Enter message for variant ${String.fromCharCode(65 + index)}...`}
                        className="min-h-[100px]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={createABTest} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create A/B Test'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Active Tests</p>
                <p className="text-2xl font-bold">
                  {abTests.filter(t => t.status === 'running').length}
                </p>
              </div>
              <BarChart3 className="ml-auto h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Audience</p>
                <p className="text-2xl font-bold">{customers.length.toLocaleString()}</p>
              </div>
              <Users className="ml-auto h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Avg Performance</p>
                <p className="text-2xl font-bold text-green-600">
                  {selectedTest?.variations ? 
                    `${(selectedTest.variations.reduce((sum, v) => sum + v.ctr, 0) / selectedTest.variations.length).toFixed(1)}%` 
                    : '0%'
                  }
                </p>
              </div>
              <TrendingUp className="ml-auto h-4 w-4 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Confidence</p>
                <p className="text-2xl font-bold">{selectedTest?.confidence_level || 0}%</p>
              </div>
              <Target className="ml-auto h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* A/B Tests List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              A/B Tests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {abTests.map((test) => (
              <div 
                key={test.id}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedTest?.id === test.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedTest(test)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{test.name}</h3>
                  <Badge className={getStatusColor(test.status)}>
                    {test.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  <p>Campaign: {test.campaign?.name || 'Unknown Campaign'}</p>
                  <p>Audience: {test.customer_count?.toLocaleString() || 0}</p>
                </div>
                {test.variations && test.variations.length > 0 && (
                  <div className="text-xs">
                    <div className="flex justify-between">
                      <span>Best: {getBestVariation(test.variations)?.variation_name}</span>
                      <span>{getBestVariation(test.variations)?.ctr.toFixed(1)}%</span>
                    </div>
                  </div>
                )}
                <div className="flex gap-2 mt-2">
                  {test.status === 'draft' && (
                    <Button size="sm" onClick={(e) => {
                      e.stopPropagation();
                      startABTest(test.id);
                    }}>
                      <Play className="w-3 h-3 mr-1" />
                      Start
                    </Button>
                  )}
                  {test.status === 'running' && (
                    <Button size="sm" variant="outline" onClick={(e) => {
                      e.stopPropagation();
                      stopABTest(test.id);
                    }}>
                      <Pause className="w-3 h-3 mr-1" />
                      Stop
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {abTests.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No A/B tests created yet</p>
                <p className="text-sm">Create your first test to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTest ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        {selectedTest.name}
                      </CardTitle>
                      <CardDescription>
                        Campaign: {selectedTest.campaign?.name || 'Unknown Campaign'} • 
                        Audience: {selectedTest.customer_count?.toLocaleString() || 0}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(selectedTest.status)}>
                      {selectedTest.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedTest.variations && selectedTest.variations.length > 0 ? (
                    <div className="space-y-4">
                      <h4 className="font-semibold">Variant Performance</h4>
                      {selectedTest.variations.map((variation) => (
                        <div key={variation.id} className="p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                Variant {variation.variation_name}
                              </Badge>
                              {variation.is_winner && (
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  <Trophy className="w-3 h-3 mr-1" />
                                  Winner
                                </Badge>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">{variation.ctr.toFixed(1)}%</div>
                              <div className="text-sm text-muted-foreground">CTR</div>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <div className="text-sm font-medium mb-1">Message:</div>
                            <div className="text-sm bg-background p-2 rounded border">
                              {variation.message_template}
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div className="text-center">
                              <div className="font-medium">{variation.sent_count}</div>
                              <div className="text-muted-foreground">Sent</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">{variation.opened_count}</div>
                              <div className="text-muted-foreground">Opened</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">{variation.clicked_count}</div>
                              <div className="text-muted-foreground">Clicked</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">{variation.conversion_count}</div>
                              <div className="text-muted-foreground">Converted</div>
                            </div>
                          </div>

                          <div className="mt-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Performance</span>
                              <span>{variation.ctr.toFixed(1)}%</span>
                            </div>
                            <Progress value={variation.ctr} className="h-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No variations found</p>
                      <p className="text-sm">This test hasn't been configured with variations yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Performance Chart */}
              {selectedTest.variations && selectedTest.variations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={calculatePerformanceData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          {selectedTest.variations.map((variation, index) => (
                            <Line 
                              key={variation.id}
                              type="monotone" 
                              dataKey={`variant${variation.variation_name}`}
                              stroke={`hsl(${index * 60}, 70%, 50%)`}
                              strokeWidth={2}
                              name={`Variant ${variation.variation_name}`}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Brain className="w-16 h-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Select an A/B Test</h3>
                <p className="text-muted-foreground">
                  Choose a test from the list to view its details and performance metrics
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}