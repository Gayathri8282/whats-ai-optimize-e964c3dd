import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  Edit3
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
  const { toast } = useToast();

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setEditedContent(template.content);
    setEditedSubject(template.subject);
    
    // Initialize variable values with placeholders
    const initialValues: Record<string, string> = {};
    template.variables.forEach(variable => {
      initialValues[variable] = `[${variable}]`;
    });
    setVariableValues(initialValues);
  };

  const handleVariableChange = (variable: string, value: string) => {
    setVariableValues(prev => ({
      ...prev,
      [variable]: value
    }));
  };

  const replaceVariables = (text: string) => {
    let result = text;
    Object.entries(variableValues).forEach(([variable, value]) => {
      result = result.replace(new RegExp(`{{${variable}}}`, 'g'), value || `[${variable}]`);
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

      const prompt = `Improve this WhatsApp marketing template for ${selectedTemplate.category.toLowerCase()} campaigns. Make it more engaging, personalized, and conversion-focused while keeping the same variables: ${selectedTemplate.variables.join(', ')}. Original: ${editedContent}`;

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

    const finalSubject = replaceVariables(editedSubject);
    const finalContent = replaceVariables(editedContent);

    try {
      // In a real implementation, this would send the campaign
      console.log('Sending campaign:', { subject: finalSubject, content: finalContent });
      
      toast({
        title: "Campaign Sent! 🚀",
        description: `${selectedTemplate.name} campaign has been queued for delivery`
      });
    } catch (error) {
      toast({
        title: "Send Failed",
        description: "Failed to send campaign. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gradient-primary mb-2">Campaign Templates</h2>
        <p className="text-muted-foreground">Choose and customize proven WhatsApp marketing templates</p>
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
              </Card>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSendCampaign} className="flex-1">
                <Send className="w-4 h-4 mr-2" />
                Send Campaign
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