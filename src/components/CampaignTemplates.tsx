import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  MessageSquare,
  Zap,
  Gift,
  TrendingUp,
  Users,
  Heart,
  ShoppingCart,
  Star,
  Send,
  Copy,
  Edit3,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  category: string;
  subject: string;
  content: string;
  variables: string[];
  icon: React.ReactNode;
  color: string;
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

interface SendResults {
  total: number;
  sent: number;
  failed: number;
  optedOut: number;
  details: any[];
}

const CAMPAIGN_TEMPLATES: Template[] = [
  {
    id: "welcome",
    name: "Welcome Series",
    category: "Onboarding",
    subject: "Welcome to {{company_name}}! 🎉",
    content: "Hi {{customer_name}}! \n\nWelcome to {{company_name}}! We're excited to have you join our community.\n\nAs a new customer, you'll get:\n✨ Exclusive offers\n📱 Priority support\n🎁 Special discounts\n\nReply STOP to opt out.",
    variables: ["customer_name", "company_name"],
    icon: <Heart className="w-5 h-5" />,
    color: "bg-pink-500"
  },
  {
    id: "promotion",
    name: "Flash Sale",
    category: "Promotional",
    subject: "🔥 Flash Sale: {{discount}}% OFF Everything!",
    content: "Hey {{customer_name}}! \n\n🔥 FLASH SALE ALERT! \n\nGet {{discount}}% OFF everything for the next {{duration}} hours only!\n\nUse code: {{promo_code}}\n\n🛒 Shop now: {{shop_link}}\n\nHurry, offer expires {{expiry_time}}!",
    variables: ["customer_name", "discount", "duration", "promo_code", "shop_link", "expiry_time"],
    icon: <Zap className="w-5 h-5" />,
    color: "bg-orange-500"
  },
  {
    id: "abandoned_cart",
    name: "Cart Recovery",
    category: "Recovery",
    subject: "You left something behind! 🛒",
    content: "Hi {{customer_name}}! \n\nDon't forget about the items in your cart:\n\n{{cart_items}}\n\nComplete your purchase now and get {{discount}}% off!\n\n💳 Checkout: {{checkout_link}}\n\nOffer valid for {{valid_hours}} hours.",
    variables: ["customer_name", "cart_items", "discount", "checkout_link", "valid_hours"],
    icon: <ShoppingCart className="w-5 h-5" />,
    color: "bg-blue-500"
  },
  {
    id: "birthday",
    name: "Birthday Special",
    category: "Personal",
    subject: "🎂 Happy Birthday {{customer_name}}!",
    content: "🎉 Happy Birthday {{customer_name}}! \n\nCelebrate with us and enjoy:\n\n🎁 {{gift_amount}} birthday gift\n🎂 Special birthday discount: {{discount}}%\n✨ Free shipping on your next order\n\nClaim your gift: {{claim_link}}\n\nValid until {{expiry_date}}",
    variables: ["customer_name", "gift_amount", "discount", "claim_link", "expiry_date"],
    icon: <Gift className="w-5 h-5" />,
    color: "bg-purple-500"
  },
  {
    id: "review_request",
    name: "Review Request",
    category: "Engagement",
    subject: "How was your experience? ⭐",
    content: "Hi {{customer_name}}! \n\nWe hope you loved your recent purchase of {{product_name}}!\n\n⭐ Could you take 30 seconds to share your experience?\n\n📝 Leave a review: {{review_link}}\n\nAs a thank you, get {{reward}}% off your next order!\n\nThanks for being awesome! 💙",
    variables: ["customer_name", "product_name", "review_link", "reward"],
    icon: <Star className="w-5 h-5" />,
    color: "bg-yellow-500"
  },
  {
    id: "reengagement",
    name: "Win-Back Campaign",
    category: "Retention",
    subject: "We miss you! Come back for {{discount}}% OFF 💔",
    content: "Hey {{customer_name}}! \n\nWe noticed you haven't been around lately and we miss you! 💔\n\nCome back and enjoy:\n🎯 {{discount}}% OFF your next purchase\n🆕 Check out our new arrivals\n💝 Exclusive member benefits\n\n👆 Shop now: {{return_link}}\n\nValid for {{valid_days}} days only!",
    variables: ["customer_name", "discount", "return_link", "valid_days"],
    icon: <TrendingUp className="w-5 h-5" />,
    color: "bg-green-500"
  }
];

export function CampaignTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [editedSubject, setEditedSubject] = useState("");
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectAllCustomers, setSelectAllCustomers] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [isSending, setIsSending] = useState(false);
  const [sendResults, setSendResults] = useState<SendResults | null>(null);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  // Load customers on component mount
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('customers')
        .select('id, full_name, email, phone, location, total_spent, campaigns_accepted, opt_out')
        .eq('user_id', user.id)
        .order('total_spent', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Failed to load customers:', error);
      toast({
        title: "Failed to Load Customers",
        description: "Could not load customer data",
        variant: "destructive"
      });
    }
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setEditedContent(template.content);
    setEditedSubject(template.subject);
    
    // Initialize variable values with placeholders
    const initialValues: Record<string, string> = {};
    template.variables.forEach(variable => {
      initialValues[variable] = getDefaultVariableValue(variable);
    });
    setVariableValues(initialValues);
    
    // Reset customer selection
    setSelectedCustomers([]);
    setSelectAllCustomers(false);
    setSendResults(null);
    setShowResults(false);
  };

  const getDefaultVariableValue = (variable: string): string => {
    const defaults: Record<string, string> = {
      'customer_name': '{{customer_name}}',
      'company_name': 'Your Company',
      'discount': '20',
      'duration': '24',
      'promo_code': 'FLASH20',
      'shop_link': 'https://yourstore.com',
      'expiry_time': 'midnight',
      'cart_items': 'Your selected items',
      'checkout_link': 'https://yourstore.com/checkout',
      'valid_hours': '48',
      'gift_amount': '$10',
      'claim_link': 'https://yourstore.com/birthday',
      'expiry_date': 'next week',
      'product_name': 'your recent purchase',
      'review_link': 'https://yourstore.com/review',
      'reward': '15',
      'return_link': 'https://yourstore.com/welcome-back',
      'valid_days': '7'
    };
    return defaults[variable] || `{{${variable}}}`;
  };

  const handleVariableChange = (variable: string, value: string) => {
    setVariableValues(prev => ({
      ...prev,
      [variable]: value
    }));
  };

  const handleCustomerSelection = (customerId: string, checked: boolean) => {
    if (checked) {
      setSelectedCustomers(prev => [...prev, customerId]);
    } else {
      setSelectedCustomers(prev => prev.filter(id => id !== customerId));
      setSelectAllCustomers(false);
    }
  };

  const handleSelectAllCustomers = (checked: boolean) => {
    setSelectAllCustomers(checked);
    if (checked) {
      const eligibleCustomerIds = customers.filter(c => !c.opt_out).map(c => c.id);
      setSelectedCustomers(eligibleCustomerIds);
    } else {
      setSelectedCustomers([]);
    }
  };

  const replaceVariables = (text: string): string => {
    let result = text;
    Object.entries(variableValues).forEach(([variable, value]) => {
      result = result.replace(new RegExp(`\\{\\{${variable}\\}\\}`, 'g'), value || `{{${variable}}}`);
    });
    return result;
  };

  const handleCopyTemplate = () => {
    const finalContent = replaceVariables(editedContent);
    navigator.clipboard.writeText(finalContent);
    toast({
      title: "Template Copied!",
      description: "Template content copied to clipboard"
    });
  };

  const handleGenerateAI = async () => {
    if (!selectedTemplate) return;
    
    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Please log in to use AI features");
      }

      const prompt = `Improve this ${selectedChannel} marketing template for ${selectedTemplate.category.toLowerCase()} campaigns. Make it more engaging, personalized, and conversion-focused while keeping the same variables: ${selectedTemplate.variables.join(', ')}. Original: ${editedContent}`;

      const { data, error } = await supabase.functions.invoke('advanced-chat', {
        body: {
          message: prompt,
          userId: user.id
        }
      });

      if (error) throw error;

      if (data?.response) {
        setEditedContent(data.response);
        toast({
          title: "AI Enhancement Complete!",
          description: "Template has been improved with AI"
        });
      }

    } catch (error) {
      console.error('AI generation error:', error);
      toast({
        title: "AI Enhancement Failed",
        description: "Using fallback enhancement",
        variant: "destructive"
      });
      
      // Fallback enhancement
      if (selectedTemplate.category === "Promotional") {
        setEditedContent(editedContent + "\n\n⏰ Limited time offer! Don't miss out!\n💎 VIP customers get priority access!");
      } else if (selectedTemplate.category === "Engagement") {
        setEditedContent(editedContent + "\n\n💬 Reply with your thoughts!\n🤝 Your feedback helps us serve you better!");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendCampaign = async () => {
    if (!selectedTemplate) return;

    const eligibleCustomers = selectAllCustomers 
      ? customers.filter(c => !c.opt_out)
      : customers.filter(c => selectedCustomers.includes(c.id) && !c.opt_out);

    if (eligibleCustomers.length === 0) {
      toast({
        title: "No Recipients Selected",
        description: "Please select customers to send the campaign to",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSending(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Please log in to send campaigns");
      }

      const finalSubject = replaceVariables(editedSubject);
      const finalContent = replaceVariables(editedContent);

      // Prepare the request
      const sendRequest = {
        userId: user.id,
        campaignName: selectedTemplate.name,
        messageTemplate: finalContent,
        subject: finalSubject,
        customerIds: selectAllCustomers ? undefined : selectedCustomers,
        sendToAll: selectAllCustomers
      };

      console.log('Sending campaign:', { 
        channel: selectedChannel, 
        template: selectedTemplate.name,
        customerCount: eligibleCustomers.length 
      });

      // Call the appropriate edge function
      const functionName = selectedChannel === 'whatsapp' ? 'send-whatsapp' : 'send-email';
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: sendRequest
      });

      if (error) throw error;

      if (data.success) {
        setSendResults(data.results);
        setShowResults(true);
        
        toast({
          title: `${selectedChannel === 'whatsapp' ? 'WhatsApp' : 'Email'} Campaign Sent! 🚀`,
          description: `Sent: ${data.results.sent}, Failed: ${data.results.failed}${data.results.optedOut > 0 ? `, Opted out: ${data.results.optedOut}` : ''}`,
        });
      } else {
        throw new Error(data.error || 'Failed to send campaign');
      }

    } catch (error) {
      console.error('Send campaign error:', error);
      toast({
        title: "Campaign Send Failed",
        description: error instanceof Error ? error.message : "Failed to send campaign. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const eligibleCustomerCount = customers.filter(c => !c.opt_out).length;
  const selectedEligibleCount = selectAllCustomers 
    ? eligibleCustomerCount 
    : selectedCustomers.filter(id => {
        const customer = customers.find(c => c.id === id);
        return customer && !customer.opt_out;
      }).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gradient-primary mb-2">Campaign Templates</h2>
        <p className="text-muted-foreground">Choose and customize proven WhatsApp and Email marketing templates</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CAMPAIGN_TEMPLATES.map((template) => (
          <Card 
            key={template.id} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedTemplate?.id === template.id ? 'ring-2 ring-primary border-primary' : ''
            }`}
            onClick={() => handleTemplateSelect(template)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${template.color} flex items-center justify-center text-white`}>
                  {template.icon}
                </div>
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {template.category}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {template.content.substring(0, 100)}...
              </p>
              <div className="flex flex-wrap gap-1 mt-3">
                {template.variables.slice(0, 3).map(variable => (
                  <Badge key={variable} variant="outline" className="text-xs">
                    {variable}
                  </Badge>
                ))}
                {template.variables.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{template.variables.length - 3}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedTemplate && (
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg ${selectedTemplate.color} flex items-center justify-center text-white`}>
                  {selectedTemplate.icon}
                </div>
                <div>
                  <CardTitle className="text-xl">{selectedTemplate.name}</CardTitle>
                  <Badge variant="secondary">{selectedTemplate.category}</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleGenerateAI} disabled={isGenerating} variant="outline" size="sm">
                  <Zap className="w-4 h-4 mr-2" />
                  {isGenerating ? "Enhancing..." : "AI Enhance"}
                </Button>
                <Button onClick={handleCopyTemplate} variant="outline" size="sm">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Channel Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Delivery Channel</label>
              <Select value={selectedChannel} onValueChange={(value: 'whatsapp' | 'email') => setSelectedChannel(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      WhatsApp
                    </div>
                  </SelectItem>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subject Line Editor */}
            <div>
              <label className="text-sm font-medium mb-2 block">Subject Line</label>
              <Input
                value={editedSubject}
                onChange={(e) => setEditedSubject(e.target.value)}
                placeholder="Campaign subject line..."
              />
            </div>

            {/* Variables */}
            <div>
              <label className="text-sm font-medium mb-3 block">Template Variables</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedTemplate.variables.map(variable => (
                  <div key={variable}>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      {variable.replace('_', ' ').toUpperCase()}
                    </label>
                    <Input
                      value={variableValues[variable] || ''}
                      onChange={(e) => handleVariableChange(variable, e.target.value)}
                      placeholder={`Enter ${variable}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Content Editor */}
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                Message Content
              </label>
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                placeholder="Enter your message content..."
                rows={8}
                className="font-mono"
              />
            </div>

            {/* Customer Selection */}
            <div>
              <label className="text-sm font-medium mb-3 block flex items-center gap-2">
                <Users className="w-4 h-4" />
                Select Recipients ({eligibleCustomerCount} eligible customers)
              </label>
              <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b">
                  <Checkbox
                    checked={selectAllCustomers}
                    onCheckedChange={handleSelectAllCustomers}
                  />
                  <label className="font-medium">Send to all eligible customers ({eligibleCustomerCount})</label>
                </div>
                <div className="space-y-2">
                  {customers.map(customer => (
                    <div key={customer.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50">
                      <Checkbox
                        checked={selectAllCustomers || selectedCustomers.includes(customer.id)}
                        onCheckedChange={(checked) => handleCustomerSelection(customer.id, checked as boolean)}
                        disabled={customer.opt_out || selectAllCustomers}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{customer.full_name}</span>
                          {customer.opt_out && (
                            <Badge variant="destructive" className="text-xs">Opted Out</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {selectedChannel === 'whatsapp' ? customer.phone : customer.email} • 
                          {customer.location} • ${customer.total_spent} spent
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Selected: {selectedEligibleCount} recipients
              </div>
            </div>

            {/* Preview */}
            <div>
              <label className="text-sm font-medium mb-2 block">Preview</label>
              <Card className="p-4 bg-muted/20 border-2 border-dashed">
                <div className="mb-2">
                  <strong>Subject:</strong> {replaceVariables(editedSubject)}
                </div>
                <div className="whitespace-pre-wrap text-sm">
                  {replaceVariables(editedContent)}
                </div>
                {selectedChannel === 'whatsapp' && (
                  <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                    + Automatic opt-out footer: "Reply STOP to opt out from future messages."
                  </div>
                )}
                {selectedChannel === 'email' && (
                  <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                    + Automatic opt-out footer with unsubscribe instructions
                  </div>
                )}
              </Card>
            </div>

            {/* Send Results */}
            {showResults && sendResults && (
              <div>
                <label className="text-sm font-medium mb-3 block">Campaign Results</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <Card className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-sm font-medium">Total</span>
                    </div>
                    <div className="text-2xl font-bold">{sendResults.total}</div>
                  </Card>
                  <Card className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">Sent</span>
                    </div>
                    <div className="text-2xl font-bold text-green-500">{sendResults.sent}</div>
                  </Card>
                  <Card className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium">Failed</span>
                    </div>
                    <div className="text-2xl font-bold text-red-500">{sendResults.failed}</div>
                  </Card>
                  <Card className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">Opted Out</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-500">{sendResults.optedOut}</div>
                  </Card>
                </div>
                {sendResults.details.length > 0 && (
                  <Card className="p-4 max-h-48 overflow-y-auto">
                    <h4 className="font-medium mb-2">Detailed Results</h4>
                    <div className="space-y-2">
                      {sendResults.details.map((detail, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          {detail.status === 'sent' ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span>{detail.customer}</span>
                          <span className="text-muted-foreground">
                            ({selectedChannel === 'whatsapp' ? detail.phone : detail.email})
                          </span>
                          {detail.error && (
                            <span className="text-red-500 text-xs">{detail.error}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleSendCampaign} 
                className="flex-1"
                disabled={isSending || selectedEligibleCount === 0}
              >
                {isSending ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send {selectedChannel === 'whatsapp' ? 'WhatsApp' : 'Email'} Campaign ({selectedEligibleCount})
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}