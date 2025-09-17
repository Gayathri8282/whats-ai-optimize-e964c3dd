import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const groqApiKey = Deno.env.get('GROQ_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId } = await req.json();
    
    console.log('Chat request:', { message, userId });

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user's analytics and customer data for context
    const [analyticsResult, customersResult] = await Promise.all([
      supabase.rpc('compute_campaign_analytics', { user_uuid: userId }),
      supabase.from('customers').select('*').eq('user_id', userId).limit(10)
    ]);

    console.log('Data fetched:', { 
      analytics: analyticsResult.data, 
      customerCount: customersResult.data?.length 
    });

    const analytics = analyticsResult.data;
    const customers = customersResult.data || [];

    // Build context for the AI
    const context = {
      totalCustomers: analytics?.total_customers || 0,
      totalRevenue: analytics?.total_revenue || 0,
      roi: analytics?.roi || 0,
      avgCTR: analytics?.avg_ctr || 0,
      sentiment: analytics?.sentiment || { positive: 0, neutral: 0, negative: 0 },
      topCustomers: customers.slice(0, 3).map(c => ({
        name: c.full_name,
        spent: c.total_spent,
        location: c.location,
        campaigns: c.campaigns_accepted
      }))
    };

    console.log('Context built:', context);

    // Create system prompt with business context
    const systemPrompt = `You are an advanced WhatsApp Marketing Assistant for a sophisticated marketing platform. You have access to real-time business data and can provide intelligent insights.

CURRENT BUSINESS CONTEXT:
- Total Customers: ${context.totalCustomers}
- Total Revenue: $${context.totalRevenue?.toFixed(2)}
- ROI: ${context.roi?.toFixed(1)}%
- Average CTR: ${context.avgCTR?.toFixed(1)}%
- Customer Sentiment: ${context.sentiment.positive} positive, ${context.sentiment.neutral} neutral, ${context.sentiment.negative} negative
- Top Customers: ${context.topCustomers.map(c => `${c.name} ($${c.spent})`).join(', ')}

CAPABILITIES:
1. Campaign Performance Analysis - Analyze ROI, CTR, and conversion metrics
2. Customer Segmentation - Provide insights on high-value vs. low-value customers
3. Marketing Strategy - Suggest campaigns based on customer behavior
4. Sentiment Analysis - Interpret customer feedback and complaints
5. Revenue Optimization - Recommend actions to increase revenue
6. Market Insights - Provide data-driven marketing recommendations

PERSONALITY:
- Expert marketing consultant with deep analytics knowledge
- Proactive in suggesting actionable insights
- Uses data to back up every recommendation
- Friendly but professional tone
- Always provide specific, measurable suggestions

RESPONSE STYLE:
- Start with a direct answer
- Include relevant data points
- Provide 2-3 actionable recommendations
- Use marketing terminology appropriately
- Keep responses under 200 words but information-dense`;

    // Analyze the message to provide contextual responses
    let aiResponse = "";
    
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile', // Fast and capable model
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Groq API error:', errorData);
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      aiResponse = data.choices[0].message.content;
    } catch (error) {
      console.error('Groq error, using fallback:', error.message);
      
      // Intelligent fallback responses based on message content and data
      if (message.toLowerCase().includes('campaign') || message.toLowerCase().includes('performance')) {
        aiResponse = `📊 **Campaign Performance Analysis**

Based on your current data:
• **${context.totalCustomers} customers** generating **$${context.totalRevenue?.toFixed(2)} revenue**
• **ROI: ${context.roi?.toFixed(1)}%** - Excellent performance! 
• **Average CTR: ${context.avgCTR?.toFixed(1)}%** - Strong engagement

**Top Performers:**
${context.topCustomers.map(c => `• ${c.name}: $${c.spent} (${c.campaigns} campaigns)`).join('\n')}

**Recommendations:**
1. Target similar profiles to your top customers
2. A/B test your messaging for even better CTR
3. Consider premium campaigns for high-value segments`;

      } else if (message.toLowerCase().includes('customer') || message.toLowerCase().includes('segment')) {
        aiResponse = `👥 **Customer Insights & Segmentation**

**Portfolio Overview:**
• **Total Customers:** ${context.totalCustomers}
• **Sentiment Distribution:** ${context.sentiment.positive} positive, ${context.sentiment.neutral} neutral, ${context.sentiment.negative} negative

**High-Value Customers:**
${context.topCustomers.map(c => `• **${c.name}** - $${c.spent} spent | ${c.location} | ${c.campaigns} campaigns accepted`).join('\n')}

**Segmentation Strategy:**
1. **VIP Tier** (>$1000): Personalized premium campaigns
2. **Active Tier** ($500-$1000): Regular engagement campaigns  
3. **Growth Tier** (<$500): Re-engagement and upsell campaigns`;

      } else if (message.toLowerCase().includes('roi') || message.toLowerCase().includes('revenue') || message.toLowerCase().includes('profit')) {
        aiResponse = `💰 **Revenue & ROI Analysis**

**Current Performance:**
• **Total Revenue:** $${context.totalRevenue?.toFixed(2)}
• **ROI:** ${context.roi?.toFixed(1)}% (Outstanding!)
• **Revenue per Customer:** $${(context.totalRevenue / context.totalCustomers)?.toFixed(2)}

**Revenue Drivers:**
${context.topCustomers.map((c, i) => `${i + 1}. ${c.name}: $${c.spent} (${((c.spent / context.totalRevenue) * 100)?.toFixed(1)}% of total)`).join('\n')}

**Optimization Opportunities:**
1. Focus on customers similar to your top 20%
2. Implement tiered pricing for premium segments
3. Cross-sell to customers with single category purchases`;

      } else if (message.toLowerCase().includes('help') || message.toLowerCase().includes('what can you do')) {
        aiResponse = `🚀 **Advanced Marketing Assistant Capabilities**

I have real-time access to your business data:
• **${context.totalCustomers} customers** | **$${context.totalRevenue?.toFixed(2)} revenue** | **${context.roi?.toFixed(1)}% ROI**

**What I Can Help With:**
📈 **Campaign Analysis** - Performance metrics, ROI optimization
👥 **Customer Segmentation** - VIP identification, targeting strategies  
💰 **Revenue Insights** - Profit analysis, growth opportunities
📱 **WhatsApp Strategy** - Message timing, content optimization
📊 **Data Interpretation** - Trend analysis, actionable recommendations

**Try asking me:**
• "How can I increase my ROI?"
• "Which customers should I target next?"
• "Analyze my campaign performance"
• "What's my best customer segment?"`;

      } else {
        aiResponse = `👋 Hello! I'm your **Advanced Marketing AI** with access to your live business data.

**Quick Overview:**
• **${context.totalCustomers} customers** generating **$${context.totalRevenue?.toFixed(2)} revenue**
• **${context.roi?.toFixed(1)}% ROI** with **${context.avgCTR?.toFixed(1)}% average CTR**
• **Customer Sentiment:** ${context.sentiment.positive} positive, ${context.sentiment.neutral} neutral, ${context.sentiment.negative} negative

I can provide detailed insights on campaigns, customer segmentation, revenue optimization, and marketing strategies. What would you like to explore?`;
      }
    }

    console.log('AI response generated:', aiResponse.substring(0, 100));

    return new Response(JSON.stringify({ 
      response: aiResponse,
      context: {
        hasData: context.totalCustomers > 0,
        metrics: {
          customers: context.totalCustomers,
          revenue: context.totalRevenue,
          roi: context.roi
        }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in advanced-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: "I'm experiencing technical difficulties. Please try again in a moment."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});