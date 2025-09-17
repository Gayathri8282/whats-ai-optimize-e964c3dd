import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
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
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

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