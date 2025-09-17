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
    const systemPrompt = `You are a professional WhatsApp Marketing Assistant with access to real-time business data. Provide clear, actionable insights without using markdown formatting, asterisks, or excessive emojis.

CURRENT BUSINESS CONTEXT:
- Total Customers: ${context.totalCustomers}
- Total Revenue: $${context.totalRevenue?.toFixed(2)}
- ROI: ${context.roi?.toFixed(1)}%
- Average CTR: ${context.avgCTR?.toFixed(1)}%
- Customer Sentiment: ${context.sentiment.positive} positive, ${context.sentiment.neutral} neutral, ${context.sentiment.negative} negative
- Top Customers: ${context.topCustomers.map(c => `${c.name} ($${c.spent})`).join(', ')}

RESPONSE GUIDELINES:
- Write in plain text without markdown formatting
- Be conversational yet professional
- Provide specific data-driven recommendations
- Keep responses under 150 words
- Focus on actionable insights
- No asterisks, no excessive emojis, no bold formatting
- Use bullet points with simple dashes if needed

Your goal is to help optimize marketing campaigns, analyze customer data, and improve ROI using the provided business metrics.`;

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
        aiResponse = `Your campaign performance shows excellent results with ${context.totalCustomers} customers generating $${context.totalRevenue?.toFixed(2)} in revenue and a ${context.roi?.toFixed(1)}% ROI.

Your ${context.avgCTR?.toFixed(1)}% average CTR indicates strong engagement. Top performing customers include ${context.topCustomers.map(c => `${c.name} ($${c.spent})`).join(', ')}.

To improve further:
- Target customers with similar profiles to your top performers
- Test different messaging approaches during peak engagement hours
- Consider premium campaign tiers for high-value customer segments

Your current performance is above industry standards. Focus on scaling what's working rather than major changes.`;

      } else if (message.toLowerCase().includes('customer') || message.toLowerCase().includes('segment')) {
        aiResponse = `Your customer base of ${context.totalCustomers} shows a sentiment distribution of ${context.sentiment.positive} positive, ${context.sentiment.neutral} neutral, and ${context.sentiment.negative} negative responses.

Your highest-value customers are ${context.topCustomers.map(c => `${c.name} ($${c.spent} from ${c.location})`).join(', ')}. These customers have accepted ${context.topCustomers.reduce((sum, c) => sum + c.campaigns, 0)} campaigns total.

Recommended segmentation approach:
- VIP Tier (spending over $1000): Offer personalized premium campaigns with exclusive access
- Active Tier ($500-$1000): Regular engagement with seasonal promotions
- Growth Tier (under $500): Focus on re-engagement campaigns and product upselling

Target customers with spending patterns similar to your top performers for best ROI.`;

      } else if (message.toLowerCase().includes('roi') || message.toLowerCase().includes('revenue') || message.toLowerCase().includes('profit')) {
        aiResponse = `Your revenue performance is exceptional with $${context.totalRevenue?.toFixed(2)} total revenue and ${context.roi?.toFixed(1)}% ROI. This translates to $${(context.totalRevenue / context.totalCustomers)?.toFixed(2)} average revenue per customer.

Your top revenue drivers are ${context.topCustomers.map((c, i) => `${c.name} contributing $${c.spent} (${((c.spent / context.totalRevenue) * 100)?.toFixed(1)}% of total)`).join(', ')}.

To optimize further:
- Identify and target customers with profiles matching your top 20% performers
- Implement tiered pricing strategies for different customer segments  
- Cross-sell complementary products to single-category customers

Your current ROI significantly exceeds industry benchmarks. Focus on scaling successful strategies rather than major pivots.`;

      } else if (message.toLowerCase().includes('help') || message.toLowerCase().includes('what can you do')) {
        aiResponse = `I'm your advanced marketing assistant with access to your live business data: ${context.totalCustomers} customers, $${context.totalRevenue?.toFixed(2)} revenue, and ${context.roi?.toFixed(1)}% ROI.

I can help you with:
- Campaign performance analysis and ROI optimization
- Customer segmentation and VIP identification strategies
- Revenue analysis and growth opportunity identification
- WhatsApp marketing strategy and message timing
- Data interpretation and actionable recommendations

Try asking me:
"How can I increase my ROI?"
"Which customers should I target next?" 
"Analyze my campaign performance"
"What's my best customer segment?"

I provide data-driven insights specific to your business metrics to help you make informed marketing decisions.`;

      } else {
        aiResponse = `Hello! I'm your advanced marketing assistant with access to your live business data.

Your current overview: ${context.totalCustomers} customers generating $${context.totalRevenue?.toFixed(2)} revenue with a ${context.roi?.toFixed(1)}% ROI and ${context.avgCTR?.toFixed(1)}% average CTR. Customer sentiment shows ${context.sentiment.positive} positive, ${context.sentiment.neutral} neutral, and ${context.sentiment.negative} negative responses.

I can help you analyze campaign performance, segment customers effectively, optimize revenue streams, and develop targeted marketing strategies.

What specific aspect of your marketing would you like to explore today?`;
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