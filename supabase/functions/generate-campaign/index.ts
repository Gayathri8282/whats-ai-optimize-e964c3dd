import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      campaignType, 
      targetAudience, 
      businessInfo, 
      goals, 
      tone 
    } = await req.json();

    if (!campaignType || !targetAudience) {
      return new Response(JSON.stringify({ error: 'Campaign type and target audience are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Generating campaign for:', { campaignType, targetAudience, businessInfo, goals, tone });

    // Template-based campaign generation
    const templates = {
      promotional: {
        new: "🎉 Welcome! Get 20% off your first order with code WELCOME20. Limited time offer! Shop now: [LINK]",
        returning: "🌟 We missed you! Here's 15% off your next purchase. Use code COMEBACK15: [LINK]",
        vip: "💎 VIP Exclusive: 30% off premium collection just for you! Code: VIP30 [LINK]",
        all: "🛍️ Flash Sale Alert! 25% off everything today only. Code: FLASH25 [LINK]"
      },
      announcement: {
        new: "📢 Exciting news! We've launched something special just for you. Check it out: [LINK]",
        returning: "🔔 Important update for our valued customers. See what's new: [LINK]",
        vip: "⭐ VIP Preview: Be the first to know about our latest launch: [LINK]",
        all: "📰 Big announcement! Don't miss out on this exciting update: [LINK]"
      },
      onboarding: {
        new: "👋 Welcome aboard! Here's everything you need to get started: [LINK]",
        returning: "🔄 Welcome back! Let's pick up where you left off: [LINK]",
        vip: "🎯 VIP Onboarding: Your premium experience starts here: [LINK]",
        all: "🚀 Let's get you set up! Your journey begins now: [LINK]"
      },
      survey: {
        new: "💭 Quick question: How was your first experience with us? Share feedback: [LINK]",
        returning: "🗣️ Your opinion matters! Quick 2-minute survey for a chance to win: [LINK]",
        vip: "👑 VIP Feedback: Help us serve you better. Exclusive rewards await: [LINK]",
        all: "📝 We value your input! Share your thoughts and get rewarded: [LINK]"
      }
    };

    const campaignNames = {
      promotional: { new: "New Customer Welcome Offer", returning: "Comeback Campaign", vip: "VIP Exclusive Sale", all: "Flash Sale Blast" },
      announcement: { new: "New Customer Announcement", returning: "Customer Update", vip: "VIP Preview", all: "Major Announcement" },
      onboarding: { new: "New User Onboarding", returning: "Return Journey", vip: "VIP Onboarding", all: "User Setup Guide" },
      survey: { new: "First Experience Survey", returning: "Customer Feedback", vip: "VIP Opinion Poll", all: "Customer Survey" }
    };

    const name = campaignNames[campaignType as keyof typeof campaignNames]?.[targetAudience as keyof typeof campaignNames.promotional] || `${campaignType} Campaign`;
    const messageTemplate = templates[campaignType as keyof typeof templates]?.[targetAudience as keyof typeof templates.promotional] || `Hi! We have exciting ${campaignType} news for our ${targetAudience} customers. Learn more: [LINK]`;

    const structuredResponse = {
      name,
      messageTemplate,
      variations: [
        messageTemplate,
        messageTemplate.replace('Hi!', 'Hello!').replace('🎉', '✨'),
        messageTemplate.replace('[LINK]', 'tap here: [LINK]')
      ],
      bestPractices: [
        "Keep messages personal and engaging",
        "Include clear call-to-action", 
        "Test different variations",
        "Use emojis appropriately",
        "Personalize with customer names when possible"
      ],
      estimatedEngagement: { 
        openRate: "68%", 
        responseRate: "18%", 
        clickRate: "12%" 
      }
    };

    console.log('Generated campaign:', structuredResponse);
    
    return new Response(JSON.stringify(structuredResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-campaign function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});