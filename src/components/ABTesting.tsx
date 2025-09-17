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
import { Loader2, Send, RefreshCw, Brain, Target, Play, Pause, Plus, TrendingUp, Users, BarChart3, Trophy, Database } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
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
  total_spent: number;
  opt_out: boolean;
}

interface ABTestResult {
  id: string;
  ab_test_id: string;
  variation_id: string;
  customer_id: string;
  message_sent: boolean;
  opened: boolean;
  clicked: boolean;
  converted: boolean;
  replied: boolean;
  revenue: number;
  assigned_at: string;
}

export function ABTesting() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [abTests, setAbTests] = useState<ABTest[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [variants, setVariants] = useState<string[]>(['', '', '']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [testName, setTestName] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [trafficSplit, setTrafficSplit] = useState(50);
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
        .select('id, full_name, email, phone, location, total_spent, opt_out')
        .eq('opt_out', false)
        .order('created_at', { ascending: false });

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

  const seedTestData = async () => {
    setIsSeeding(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-test-data');
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Test data seeded successfully! Refreshing data...",
      });
      
      // Reload data
      await Promise.all([fetchCampaigns(), fetchCustomers(), fetchABTests()]);
    } catch (error: any) {
      console.error('Error seeding test data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to seed test data",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const getEligibleCustomers = (audience: string) => {
    const eligibleCustomers = customers.filter(c => !c.opt_out);
    
    switch (audience) {
      case 'Premium Customers':
        return eligibleCustomers.filter(c => c.total_spent > 1000);
      case 'New Customers':
        return eligibleCustomers.filter(c => c.total_spent < 200);
      case 'Loyal Customers':
        return eligibleCustomers.filter(c => c.total_spent > 500);
      case 'At-Risk Customers':
        return eligibleCustomers.filter(c => c.total_spent < 100);
      default:
        return eligibleCustomers;
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

      console.log('🔄 Generating variants with request:', JSON.stringify(requestBody, null, 2));
      
      const { data, error } = await supabase.functions.invoke('ab-testing-agent', {
        body: requestBody,
      });

      console.log('✅ AI response data:', data);
      console.log('❌ AI response error:', error);

      if (error) throw error;

      let variantTexts: string[] = [];
      
      if (data?.variants && Array.isArray(data.variants)) {
        // Handle both string variants and object variants with message property
        variantTexts = data.variants.map((variant: any) => {
          if (typeof variant === 'string') {
            return variant;
          } else if (typeof variant === 'object' && variant.message) {
            return variant.message;
          } else if (typeof variant === 'object') {
            // Handle cases where the variant object has properties like variant1, variant2, etc.
            const keys = Object.keys(variant);
            return variant[keys[0]] || JSON.stringify(variant);
          }
          return String(variant);
        });
      } else {
        // Fallback variants
        variantTexts = [
          `🎉 ${selectedCampaign.name}! ${selectedCampaign.message_template.substring(0, 80)}...`,
          `Hey! ${selectedCampaign.message_template.substring(0, 80)}... 🔥`,
          `Special offer: ${selectedCampaign.message_template.substring(0, 80)}... ⚡`
        ];
      }

      console.log('🎯 Raw variants from API:', data.variants);
      console.log('🎯 Processed variants:', variantTexts);
      
      setVariants(variantTexts);
      toast({
        title: "Variants Generated! ✨",
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

    const eligibleCustomers = getEligibleCustomers(targetAudience || selectedCampaign.target_audience);
    
    if (eligibleCustomers.length === 0) {
      toast({
        title: "No Eligible Customers",
        description: "No customers found for the selected audience. Try seeding test data first.",
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
          customer_count: eligibleCustomers.length,
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
            audience_count: Math.floor(eligibleCustomers.length / variants.length),
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
        description: `Successfully created "${testName}" with ${variants.length} variations for ${eligibleCustomers.length} customers.`,
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
    setIsStarting(true);
    try {
      console.log('🚀 Starting A/B test with ID:', testId);
      
      const { data, error } = await supabase.functions.invoke('start-ab-test', {
        body: { testId }
      });

      console.log('📊 Start test response:', data);
      console.log('❌ Start test error:', error);

      if (error) throw error;

      toast({
        title: "A/B Test Started! 🎯",
        description: `Test is now running with seed test data. Assigned ${data?.customersAssigned || 'multiple'} customers.`,
      });

      // Refresh all data to show updated metrics
      await Promise.all([
        fetchABTests(),
        fetchCustomers()
      ]);
      
      // Also refresh the selected test's variations if it's the one we just started
      if (selectedTest && selectedTest.id === testId) {
        const { data: updatedVariations } = await supabase
          .from('ab_test_variations')
          .select('*')
          .eq('ab_test_id', testId);
          
        if (updatedVariations) {
          setSelectedTest(prev => prev ? {
            ...prev,
            variations: updatedVariations
          } : prev);
        }
      }
    } catch (error: any) {
      console.error('Error starting A/B test:', error);
      toast({
        title: "Start Failed",
        description: error.message || "Failed to start the A/B test. Check if you have seed data.",
        variant: "destructive",
      });
    } finally {
      setIsStarting(false);
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
    
    return selectedTest.variations.map(variation => ({
      name: `Variant ${variation.variation_name}`,
      CTR: parseFloat(variation.ctr.toFixed(2)),
      Conversions: variation.conversion_count,
      Revenue: variation.conversion_count * 150, // Estimated revenue
      Opens: variation.opened_count,
      Clicks: variation.clicked_count,
      Sent: variation.sent_count
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
            <p className="text-muted-foreground flex items-center gap-2">
              <Database className="w-4 h-4 text-success" />
              Smart campaign optimization with real customer data • {campaigns.length} campaigns loaded
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={seedTestData}
            disabled={isSeeding}
          >
            <Database className="w-4 h-4 mr-2" />
            {isSeeding ? 'Seeding...' : 'Seed Test Data'}
          </Button>
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
                  Set up a new A/B test with AI-generated variants using real customer data
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-6">
                {/* Test Configuration */}
                <div className="space-y-4">
                  <div>
                    <Label>Test Name</Label>
                    <Input
                      value={testName}
                      onChange={(e) => setTestName(e.target.value)}
                      placeholder="Enter test name"
                    />
                  </div>
                  
                  <div>
                    <Label>Select Campaign</Label>
                    <Select onValueChange={(value) => {
                      const campaign = campaigns.find(c => c.id === value);
                      setSelectedCampaign(campaign || null);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a campaign" />
                      </SelectTrigger>
                      <SelectContent>
                        {campaigns.map(campaign => (
                          <SelectItem key={campaign.id} value={campaign.id}>
                            {campaign.name} ({campaign.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {campaigns.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No campaigns found. Create a campaign first or seed test data.
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Target Audience</Label>
                    <Select value={targetAudience} onValueChange={setTargetAudience}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Customers ({customers.length})</SelectItem>
                        <SelectItem value="Premium Customers">Premium Customers ({customers.filter(c => c.total_spent > 1000).length})</SelectItem>
                        <SelectItem value="New Customers">New Customers ({customers.filter(c => c.total_spent < 200).length})</SelectItem>
                        <SelectItem value="Loyal Customers">Loyal Customers ({customers.filter(c => c.total_spent > 500).length})</SelectItem>
                        <SelectItem value="At-Risk Customers">At-Risk Customers ({customers.filter(c => c.total_spent < 100).length})</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Traffic Split (%)</Label>
                    <Input
                      type="number"
                      value={trafficSplit}
                      onChange={(e) => setTrafficSplit(Number(e.target.value))}
                      min="10"
                      max="90"
                    />
                  </div>
                </div>

                {/* Product Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Product Details (for AI generation)</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Product Name</Label>
                      <Input
                        value={productDetails.name}
                        onChange={(e) => setProductDetails(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Product name"
                      />
                    </div>
                    <div>
                      <Label>Price</Label>
                      <Input
                        value={productDetails.price}
                        onChange={(e) => setProductDetails(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="$99.99"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={productDetails.description}
                      onChange={(e) => setProductDetails(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Product description"
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <Label>Key Features</Label>
                    <Input
                      value={productDetails.features}
                      onChange={(e) => setProductDetails(prev => ({ ...prev, features: e.target.value }))}
                      placeholder="Feature 1, Feature 2, Feature 3"
                    />
                  </div>
                  
                   {/* Debug info for seed data visibility */}
                   <div className="p-3 bg-muted/30 rounded-lg text-sm space-y-1">
                     <p><strong>📊 Data Status:</strong></p>
                     <p>• Total Customers: {customers.length}</p>
                     <p>• Total Campaigns: {campaigns.length}</p>
                     <p>• A/B Tests: {abTests.length}</p>
                     {selectedCampaign && (
                       <p>• Eligible for "{targetAudience || selectedCampaign.target_audience}": {getEligibleCustomers(targetAudience || selectedCampaign.target_audience).length}</p>
                     )}
                   </div>
                </div>
              </div>

              {/* AI Generation Section */}
              {selectedCampaign && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">AI-Generated Variants</h3>
                    <Button
                      onClick={generateVariants}
                      disabled={isGenerating}
                      variant="outline"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4 mr-2" />
                          Generate Variants
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {variants.map((variant, index) => (
                      <div key={index}>
                        <Label>Variant {String.fromCharCode(65 + index)}</Label>
                        <Textarea
                          value={variant}
                          onChange={(e) => {
                            const newVariants = [...variants];
                            newVariants[index] = e.target.value;
                            setVariants(newVariants);
                          }}
                          placeholder={`Variant ${String.fromCharCode(65 + index)} message`}
                          rows={2}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

               <DialogFooter>
                 <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                   Cancel
                 </Button>
                 <Button 
                   onClick={createABTest} 
                   disabled={isCreating || !selectedCampaign || !testName.trim() || variants.some(v => !v.trim())}
                 >
                   {isCreating ? (
                     <>
                       <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tests</p>
                <p className="text-2xl font-bold">{abTests.length}</p>
              </div>
              <Target className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Running Tests</p>
                <p className="text-2xl font-bold text-green-600">
                  {abTests.filter(t => t.status === 'running').length}
                </p>
              </div>
              <Play className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">{customers.length}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg CTR</p>
                <p className="text-2xl font-bold text-green-600">
                  {abTests.length > 0 && abTests.some(t => t.variations && t.variations.length > 0)
                    ? abTests
                        .filter(t => t.variations && t.variations.length > 0)
                        .reduce((sum, test) => {
                          const avgCtr = test.variations!.reduce((s, v) => s + v.ctr, 0) / test.variations!.length;
                          return sum + avgCtr;
                        }, 0) / abTests.filter(t => t.variations && t.variations.length > 0).length
                      : 0}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* A/B Tests List and Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tests List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>A/B Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {abTests.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No A/B tests yet</h3>
                <p className="text-muted-foreground mb-4">Create your first A/B test to get started</p>
                {customers.length === 0 && (
                  <p className="text-sm text-muted-foreground mb-4">
                    💡 Tip: Click "Seed Test Data" to add sample data
                  </p>
                )}
              </div>
            ) : (
              abTests.map((test) => (
                <Card 
                  key={test.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedTest?.id === test.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedTest(test)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">{test.name}</h4>
                      <Badge className={getStatusColor(test.status)}>
                        {test.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {test.campaign?.name || 'Unknown Campaign'}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span>{test.customer_count} customers</span>
                      {test.confidence_level > 0 && (
                        <span className="text-green-600">
                          {test.confidence_level}% confidence
                        </span>
                      )}
                    </div>
                    {test.status === 'draft' && (
                      <Button 
                        size="sm" 
                        className="w-full mt-2" 
                        onClick={(e) => {
                          e.stopPropagation();
                          startABTest(test.id);
                        }}
                        disabled={isStarting}
                      >
                        {isStarting ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Starting...
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 mr-1" />
                            Start Test
                          </>
                        )}
                      </Button>
                    )}
                    {test.status === 'running' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full mt-2" 
                        onClick={(e) => {
                          e.stopPropagation();
                          stopABTest(test.id);
                        }}
                      >
                        <Pause className="w-3 h-3 mr-1" />
                        Stop Test
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* Test Results */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTest ? (
            <>
              {/* Test Overview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedTest.name}</CardTitle>
                      <CardDescription>
                        Campaign: {selectedTest.campaign?.name} | 
                        Audience: {selectedTest.target_audience} | 
                        Status: {selectedTest.status}
                      </CardDescription>
                    </div>
                    {selectedTest.winner_variation && (
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <span className="font-semibold">
                          Winner: Variant {selectedTest.winner_variation}
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedTest.variations && selectedTest.variations.length > 0 && (
                    <div className="space-y-4">
                      {/* Performance Chart */}
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={calculatePerformanceData()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="CTR" fill="#8884d8" name="CTR %" />
                            <Bar dataKey="Conversions" fill="#82ca9d" name="Conversions" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Variations Performance */}
                      <div className="grid grid-cols-1 gap-4">
                        {selectedTest.variations.map((variation) => (
                          <Card key={variation.id} className={variation.is_winner ? 'ring-2 ring-yellow-400' : ''}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">Variant {variation.variation_name}</h4>
                                  {variation.is_winner && (
                                    <Trophy className="w-4 h-4 text-yellow-500" />
                                  )}
                                </div>
                                <Badge variant="outline">
                                  CTR: {variation.ctr.toFixed(2)}%
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {variation.message_template}
                              </p>
                              
                              <div className="grid grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Sent</p>
                                  <p className="font-semibold">{variation.sent_count}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Opened</p>
                                  <p className="font-semibold">{variation.opened_count}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Clicked</p>
                                  <p className="font-semibold">{variation.clicked_count}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Converted</p>
                                  <p className="font-semibold">{variation.conversion_count}</p>
                                </div>
                              </div>
                              
                              <div className="mt-3">
                                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                  <span>Click-through Rate</span>
                                  <span>{variation.ctr.toFixed(2)}%</span>
                                </div>
                                <Progress value={variation.ctr} className="h-2" />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Select an A/B Test</h3>
                <p className="text-muted-foreground">
                  Choose a test from the list to view detailed results and performance metrics
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}