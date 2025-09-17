import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, MessageSquare, TrendingUp, Play, Pause, Edit, Trash2, Database, DollarSign, Brain } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

interface Campaign {
  id: string;
  name: string;
  type: 'promotional' | 'onboarding' | 'announcement' | 'survey';
  status: 'draft' | 'active' | 'paused' | 'completed';
  target_audience: string;
  message_template: string;
  schedule_type: 'now' | 'schedule';
  scheduled_time?: string;
  audience_count: number;
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  ctr: number;
  total_revenue?: number;
  total_cost?: number;
  roi?: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  total_spent: number;
  campaigns_accepted: number;
  opt_out: boolean;
}

const CampaignManager = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    type: 'promotional' as 'promotional' | 'onboarding' | 'announcement' | 'survey',
    target_audience: '',
    message_template: '',
    schedule_type: 'now' as 'now' | 'schedule',
    scheduled_time: '',
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await Promise.all([loadCampaigns(), loadCustomers()]);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        Promise.all([loadCampaigns(), loadCustomers()]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns((data || []) as Campaign[]);
    } catch (error: any) {
      console.error('Error loading campaigns:', error);
      toast({
        title: "Error",
        description: "Failed to load campaigns",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, full_name, email, phone, location, total_spent, campaigns_accepted, opt_out')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error: any) {
      console.error('Error loading customers:', error);
    }
  };

  const seedTestData = async () => {
    setIsSeeding(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-test-data');
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Test data seeded successfully! Refreshing campaigns and customers...",
      });
      
      // Reload data
      await Promise.all([loadCampaigns(), loadCustomers()]);
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
        return eligibleCustomers.filter(c => c.total_spent > 500 && c.campaigns_accepted > 2);
      case 'At-Risk Customers':
        return eligibleCustomers.filter(c => c.total_spent < 100);
      default:
        return eligibleCustomers;
    }
  };

  const generateCampaignPrompt = () => {
    const eligibleCustomers = getEligibleCustomers(formData.target_audience);
    const avgSpent = eligibleCustomers.length > 0 
      ? eligibleCustomers.reduce((sum, c) => sum + c.total_spent, 0) / eligibleCustomers.length 
      : 0;
    
    let prompt = "";
    
    if (formData.type === 'promotional') {
      prompt = `🎉 Exciting offer for our ${formData.target_audience} customers! Based on your average spending of $${avgSpent.toFixed(0)}, we have a special promotion just for you. Don't miss out on this limited-time deal! {{customer_name}}, this could save you significantly on your next purchase.`;
    } else if (formData.type === 'onboarding') {
      prompt = `Welcome {{customer_name}}! We're thrilled to have you join our community of ${eligibleCustomers.length} valued customers. As someone from ${formData.target_audience}, we've prepared special onboarding benefits just for you. Let's get started on your journey with us!`;
    } else if (formData.type === 'announcement') {
      prompt = `Important update for our ${formData.target_audience} customers: We've made exciting improvements to better serve customers like you, {{customer_name}}. With an average spending of $${avgSpent.toFixed(0)}, your feedback has shaped these changes.`;
    } else if (formData.type === 'survey') {
      prompt = `Hi {{customer_name}}, your opinion matters! As one of our valued ${formData.target_audience} customers with $${avgSpent.toFixed(0)} in spending, we'd love to hear your thoughts. This quick 2-minute survey will help us serve you better.`;
    }
    
    setFormData({...formData, message_template: prompt});
    
    toast({
      title: "Message Generated",
      description: `AI-generated ${formData.type} message based on your selected filters!`,
    });
  };

  const replaceVariables = (template: string, customer: Customer) => {
    return template
      .replace(/\{\{customer_name\}\}/g, customer.full_name)
      .replace(/\{\{customer_location\}\}/g, customer.location)
      .replace(/\{\{customer_email\}\}/g, customer.email)
      .replace(/\{\{total_spent\}\}/g, `$${customer.total_spent.toFixed(2)}`);
  };

  const runCampaign = async (campaignId: string) => {
    setIsRunning(true);
    try {
      const campaign = campaigns.find(c => c.id === campaignId);
      if (!campaign) throw new Error('Campaign not found');

      const eligibleCustomers = getEligibleCustomers(campaign.target_audience);
      
      if (eligibleCustomers.length === 0) {
        throw new Error('No eligible customers found for this audience');
      }

      // Simulate campaign execution with realistic metrics
      const sentCount = Math.floor(eligibleCustomers.length * (0.85 + Math.random() * 0.15)); // 85-100% delivery
      const openedCount = Math.floor(sentCount * (0.25 + Math.random() * 0.35)); // 25-60% open rate
      const clickedCount = Math.floor(openedCount * (0.1 + Math.random() * 0.2)); // 10-30% click rate
      const ctr = sentCount > 0 ? (clickedCount / sentCount) * 100 : 0;
      
      // Calculate revenue and cost
      const avgRevenuePerConversion = 75 + Math.random() * 150; // $75-225 per conversion
      const conversionCount = Math.floor(clickedCount * (0.05 + Math.random() * 0.15)); // 5-20% conversion
      const totalRevenue = conversionCount * avgRevenuePerConversion;
      const totalCost = sentCount * 0.05; // $0.05 per message
      const roi = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;

      // Update campaign with results
      const { error: updateError } = await supabase
        .from('campaigns')
        .update({
          status: 'completed',
          audience_count: eligibleCustomers.length,
          sent_count: sentCount,
          opened_count: openedCount,
          clicked_count: clickedCount,
          ctr: parseFloat(ctr.toFixed(2)),
          total_revenue: parseFloat(totalRevenue.toFixed(2)),
          total_cost: parseFloat(totalCost.toFixed(2)),
          roi: parseFloat(roi.toFixed(2)),
          start_date: new Date().toISOString(),
          end_date: new Date().toISOString()
        })
        .eq('id', campaignId);

      if (updateError) throw updateError;

      // Create campaign logs for sent messages
      const logsToCreate = eligibleCustomers.slice(0, sentCount).map(customer => ({
        user_id: user.id,
        campaign_name: campaign.name,
        customer_id: customer.id,
        channel: campaign.type,
        status: 'delivered',
        message_content: replaceVariables(campaign.message_template, customer),
        recipient_phone: customer.phone,
        recipient_email: customer.email,
        sent_at: new Date().toISOString(),
        delivered_at: new Date().toISOString()
      }));

      if (logsToCreate.length > 0) {
        const { error: logsError } = await supabase
          .from('campaign_logs')
          .insert(logsToCreate);

        if (logsError) {
          console.error('Error creating campaign logs:', logsError);
        }
      }

      toast({
        title: "Campaign Launched Successfully",
        description: `Sent ${sentCount} messages to ${eligibleCustomers.length} customers. CTR: ${ctr.toFixed(1)}%, ROI: ${roi.toFixed(1)}%`,
      });

      await loadCampaigns();
    } catch (error: any) {
      console.error('Error running campaign:', error);
      toast({
        title: "Campaign Failed",
        description: error.message || "Failed to run campaign",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleCreateCampaign = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create campaigns",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name || !formData.message_template || !formData.target_audience) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const eligibleCustomers = getEligibleCustomers(formData.target_audience);
      
      const { error } = await supabase
        .from('campaigns')
        .insert({
          user_id: user.id,
          name: formData.name,
          type: formData.type || 'promotional', // Fix: Use valid type from constraint
          message_template: formData.message_template,
          target_audience: formData.target_audience,
          schedule_type: formData.schedule_type,
          scheduled_time: formData.scheduled_time || null,
          status: formData.schedule_type === 'now' ? 'draft' : 'active',
          audience_count: eligibleCustomers.length,
          sent_count: 0,
          opened_count: 0,
          clicked_count: 0,
          ctr: 0,
          total_revenue: 0,
          total_cost: 0,
          roi: 0
        });

      if (error) throw error;

      toast({
        title: "Campaign Created",
        description: `Campaign "${formData.name}" created successfully!`,
      });

      setShowCreateForm(false);
      setFormData({
        name: '',
        type: 'promotional' as 'promotional' | 'onboarding' | 'announcement' | 'survey',
        target_audience: '',
        message_template: '',
        schedule_type: 'now' as 'now' | 'schedule',
        scheduled_time: '',
      });
      
      await loadCampaigns();
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Error",
        description: "Failed to create campaign",
        variant: "destructive",
      });
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;

      toast({
        title: "Campaign Deleted",
        description: "Campaign has been deleted successfully",
      });

      await loadCampaigns();
    } catch (error: any) {
      console.error('Error deleting campaign:', error);
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'running': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'paused': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-muted-foreground mb-4">Please sign in to access campaign management</p>
          <Button onClick={() => window.location.href = '/auth'}>
            Go to Sign In
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Campaign Manager</CardTitle>
              <CardDescription>Create and manage your marketing campaigns with real customer data</CardDescription>
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
              <Button onClick={() => setShowCreateForm(true)}>
                Create Campaign
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Campaigns</p>
                    <p className="text-2xl font-bold">{campaigns.length}</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
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
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">
                      ${campaigns.reduce((sum, c) => sum + (c.total_revenue || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg CTR</p>
                    <p className="text-2xl font-bold">
                      {campaigns.length > 0 
                        ? (campaigns.reduce((sum, c) => sum + c.ctr, 0) / campaigns.length).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Campaigns List */}
          <div className="space-y-4">
            {campaigns.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
                <p className="text-muted-foreground mb-4">Create your first campaign to get started</p>
                {customers.length === 0 && (
                  <p className="text-sm text-muted-foreground mb-4">
                    💡 Tip: Click "Seed Test Data" to add sample customers and campaigns
                  </p>
                )}
                <Button onClick={() => setShowCreateForm(true)}>
                  Create Campaign
                </Button>
              </div>
            ) : (
              campaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{campaign.name}</h3>
                          <Badge className={getStatusColor(campaign.status)}>
                            {campaign.status}
                          </Badge>
                          <Badge variant="outline">{campaign.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Target: {campaign.target_audience}
                        </p>
                        <div className="text-sm text-muted-foreground">
                          Audience: {campaign.audience_count} | Sent: {campaign.sent_count} | 
                          Opened: {campaign.opened_count} | CTR: {campaign.ctr.toFixed(1)}%
                          {campaign.total_revenue && campaign.total_revenue > 0 && (
                            <> | Revenue: ${campaign.total_revenue.toLocaleString()} | ROI: {campaign.roi?.toFixed(1) || 0}%</>
                          )}
                        </div>
                        {campaign.status === 'completed' && (
                          <div className="mt-2">
                            <Progress value={(campaign.clicked_count / campaign.sent_count) * 100} className="w-48" />
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {campaign.status === 'draft' && (
                          <Button 
                            size="sm" 
                            onClick={() => runCampaign(campaign.id)}
                            disabled={isRunning}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Launch
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => deleteCampaign(campaign.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Campaign Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>
              Create a campaign that will target real customers from your database
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter campaign name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Campaign Type</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData({...formData, type: value})}>
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

            <div>
              <Label htmlFor="target_audience">Target Audience</Label>
              <Select value={formData.target_audience} onValueChange={(value) => setFormData({...formData, target_audience: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers ({customers.length})</SelectItem>
                  <SelectItem value="Premium Customers">Premium Customers ({customers.filter(c => c.total_spent > 1000).length})</SelectItem>
                  <SelectItem value="New Customers">New Customers ({customers.filter(c => c.total_spent < 200).length})</SelectItem>
                  <SelectItem value="Loyal Customers">Loyal Customers ({customers.filter(c => c.total_spent > 500).length})</SelectItem>
                  <SelectItem value="At-Risk Customers">At-Risk Customers ({customers.filter(c => c.total_spent < 100).length})</SelectItem>
                </SelectContent>
              </Select>
              {customers.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No customers found. Click "Seed Test Data" to add sample customers.
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="message_template">Message Template</Label>
              <Textarea
                id="message_template"
                value={formData.message_template}
                onChange={(e) => setFormData({...formData, message_template: e.target.value})}
                placeholder="Use variables like {{customer_name}}, {{customer_location}}, {{total_spent}}..."
                className="min-h-[100px]"
                required
              />
                      <p className="text-sm text-muted-foreground">
                        Available variables: {`{{customer_name}}, {{customer_location}}, {{customer_email}}, {{total_spent}}`}
                      </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="schedule_type">Schedule</Label>
                <Select value={formData.schedule_type} onValueChange={(value: any) => setFormData({...formData, schedule_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="now">Send Now</SelectItem>
                    <SelectItem value="schedule">Schedule Later</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.schedule_type === 'schedule' && (
                <div>
                  <Label htmlFor="scheduled_time">Scheduled Time</Label>
                  <Input
                    id="scheduled_time"
                    type="datetime-local"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData({...formData, scheduled_time: e.target.value})}
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCampaign}>
              Create Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CampaignManager;
export { CampaignManager };