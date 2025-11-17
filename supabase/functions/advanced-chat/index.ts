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

// Input validation
interface ChatRequest {
  message: string;
}

function validateInput(body: any): { valid: boolean; error?: string; data?: ChatRequest } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }
  
  if (!body.message || typeof body.message !== 'string') {
    return { valid: false, error: 'Message is required and must be a string' };
  }
  
  if (body.message.length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }
  
  if (body.message.length > 5000) {
    return { valid: false, error: 'Message must be less than 5000 characters' };
  }
  
  return { valid: true, data: { message: body.message } };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = user.id; // Use authenticated user's ID

    // Validate input
    const body = await req.json();
    const validation = validateInput(body);
    
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message } = validation.data!;
    
    console.log('Chat request from user:', userId, 'Message:', message.substring(0, 100));

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
    const systemPrompt = `You are an expert WhatsApp Marketing and A/B Testing Assistant with deep knowledge of marketing analytics, campaign optimization, and customer segmentation. Provide clear, actionable insights without markdown formatting.

CURRENT BUSINESS CONTEXT:
- Total Customers: ${context.totalCustomers}
- Total Revenue: $${context.totalRevenue?.toFixed(2)}
- ROI: ${context.roi?.toFixed(1)}%
- Average CTR: ${context.avgCTR?.toFixed(1)}%
- Customer Sentiment: ${context.sentiment.positive} positive, ${context.sentiment.neutral} neutral, ${context.sentiment.negative} negative
- Top Customers: ${context.topCustomers.map(c => `${c.name} ($${c.spent})`).join(', ') || 'None yet'}

YOUR EXPERTISE INCLUDES:
- WhatsApp Marketing: Campaign creation, messaging strategies, timing optimization, multi-channel coordination
- A/B Testing: Test design, statistical significance, variation creation, result interpretation
- Customer Analytics: Segmentation, behavior analysis, lifetime value prediction, churn prevention
- Campaign Optimization: ROI improvement, conversion rate optimization, engagement strategies
- Data Analysis: Customer insights, performance metrics, sentiment analysis, trend identification
- Marketing Strategy: Targeting, personalization, retention, growth tactics

RESPONSE GUIDELINES:
- Write in plain, conversational text without markdown, asterisks, or excessive formatting
- Be specific and data-driven when business metrics are available
- Provide actionable recommendations based on the user's context
- Keep responses under 200 words but comprehensive
- Use simple dashes (-) for lists if needed
- If asked about topics outside your expertise (A/B testing, marketing, analytics, WhatsApp campaigns, customer data), politely acknowledge and redirect to your core competencies
- Answer questions about datasets, project features, technical implementation, and how this platform works
- Be helpful, knowledgeable, and professional

If the user has no data yet, guide them on getting started with the platform's features like sample data generation, campaign creation, or A/B testing setup.`;

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
          model: 'llama-3.3-70b-versatile', // Updated to current supported model
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          max_tokens: 500,
          temperature: 0.8,
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
      
      // Enhanced intelligent fallback responses
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('a/b test') || lowerMessage.includes('ab test') || lowerMessage.includes('a b test')) {
        aiResponse = `A/B testing is a powerful feature of this platform that lets you test different message variations to optimize campaign performance.

Here's how to get started:
- Navigate to the A/B Testing section from the sidebar
- Create a new test by selecting a campaign and defining 2-3 variations
- Each variation can have different message templates, timing, or targeting
- The system automatically splits your audience and tracks key metrics like open rates, click rates, and conversions
- Statistical significance is calculated automatically to determine the winning variation

Best practices:
- Test one variable at a time for clear insights
- Ensure sufficient sample size (at least 100 customers per variation)
- Run tests for at least 3-5 days to account for behavioral patterns
- Focus on metrics that align with your campaign goals

${context.totalCustomers > 0 ? `With your current ${context.totalCustomers} customers, you can run meaningful A/B tests. Try testing message tone, call-to-action phrases, or sending times.` : 'Generate sample data to start testing different campaign variations.'}`;

      } else if (lowerMessage.includes('dataset') || lowerMessage.includes('data') || lowerMessage.includes('sample')) {
        aiResponse = `This platform uses customer marketing data with detailed attributes for campaign optimization.

Dataset includes:
- Customer demographics: name, email, phone, location, age, household composition
- Purchase behavior: total spent, purchase frequency, product categories (wines, meats, fruits, gold products)
- Campaign engagement: accepted campaigns, response rates, website visits, catalog purchases
- Recency metrics: days since last purchase, complaint status

The data powers several features:
- Customer segmentation based on spending and engagement
- Campaign targeting using behavioral patterns
- A/B testing with statistical significance
- ROI and sentiment analysis

${context.totalCustomers === 0 ? 'To get started, use the Sample Data Generator to create realistic customer profiles. You can generate international data with various demographics and spending patterns.' : `You currently have ${context.totalCustomers} customers in your database with $${context.totalRevenue?.toFixed(2)} total revenue.`}

The platform also tracks real-time metrics like CTR, conversion rates, and customer sentiment for data-driven decision making.`;

      } else if (lowerMessage.includes('campaign') || lowerMessage.includes('performance') || lowerMessage.includes('marketing')) {
        aiResponse = `${context.totalCustomers > 0 ? `Your campaign performance shows ${context.totalCustomers} customers generating $${context.totalRevenue?.toFixed(2)} in revenue with a ${context.roi?.toFixed(1)}% ROI.` : 'You can create powerful multi-channel marketing campaigns once you have customer data.'}

Campaign capabilities:
- Multi-channel support: WhatsApp, Email, SMS
- AI-powered message generation based on product details
- Automated scheduling and timing optimization  
- Audience segmentation and targeting
- Real-time performance tracking (sent, opened, clicked, converted)
- Sentiment analysis of customer responses

${context.totalCustomers > 0 ? `Your ${context.avgCTR?.toFixed(1)}% average CTR ${context.avgCTR > 5 ? 'indicates strong engagement' : 'suggests room for improvement in messaging or targeting'}. Top performing customers: ${context.topCustomers.map(c => `${c.name} ($${c.spent})`).join(', ')}.` : ''}

To improve performance:
- Use A/B testing to optimize messaging
- Segment customers by behavior and spending patterns
- Personalize content based on purchase history
- Time campaigns based on customer engagement patterns
- Track and act on sentiment feedback

${context.totalCustomers === 0 ? 'Start by generating sample data or importing your customer list to begin creating campaigns.' : 'Use the Campaign Manager to create your next targeted campaign.'}`;

      } else if (lowerMessage.includes('customer') || lowerMessage.includes('segment') || lowerMessage.includes('target')) {
        aiResponse = `${context.totalCustomers > 0 ? `Your customer base of ${context.totalCustomers} shows diverse engagement levels.` : 'Customer segmentation helps you target the right audience with personalized campaigns.'}

Segmentation features:
- Automatic segmentation based on spending tiers (VIP, Active, Growth)
- Behavioral analysis: purchase frequency, product preferences, engagement rates
- Demographic filtering: location, age, household composition
- Custom audience creation for targeted campaigns

${context.totalCustomers > 0 ? `Current sentiment distribution: ${context.sentiment.positive} positive, ${context.sentiment.neutral} neutral, ${context.sentiment.negative} negative responses.

Your top customers: ${context.topCustomers.map(c => `${c.name} ($${c.spent} from ${c.location}, ${c.campaigns} campaigns accepted)`).join('; ') || 'No purchase history yet'}.

Recommended segmentation strategy:
- VIP Tier (high spenders): Premium offerings with exclusive early access
- Active Tier (regular customers): Loyalty rewards and product bundles  
- Growth Tier (potential): Re-engagement campaigns and introductory offers
- At-risk Tier (declining activity): Win-back campaigns with special incentives` : 'Once you have customer data, the platform automatically identifies high-value segments and suggests optimal targeting strategies.'}

Use the Customer Management section to view detailed profiles, similar customer analysis, and segmentation insights.`;

      } else if (lowerMessage.includes('roi') || lowerMessage.includes('revenue') || lowerMessage.includes('profit') || lowerMessage.includes('money')) {
        aiResponse = `${context.totalCustomers > 0 && context.totalRevenue > 0 ? `Your revenue performance: $${context.totalRevenue?.toFixed(2)} total revenue with ${context.roi?.toFixed(1)}% ROI, averaging $${(context.totalRevenue / context.totalCustomers)?.toFixed(2)} per customer.` : 'ROI optimization is key to marketing success. This platform provides detailed revenue tracking and analysis.'}

Revenue metrics tracked:
- Total campaign revenue and costs
- ROI percentage (return on investment)
- Revenue per customer and per campaign
- Conversion rates and customer lifetime value
- Cost per acquisition and engagement

${context.totalCustomers > 0 && context.totalRevenue > 0 ? `Your top revenue drivers: ${context.topCustomers.map((c, i) => `${c.name} ($${c.spent}, ${((c.spent / context.totalRevenue) * 100)?.toFixed(1)}% of total)`).join('; ')}.` : ''}

Optimization strategies:
- Identify and replicate patterns from high-value customers
- Use A/B testing to maximize conversion rates
- Implement tiered pricing and upselling for different segments
- Cross-sell complementary products to single-category buyers
- Re-engage dormant customers with personalized win-back campaigns
- Focus budget on channels and messages with highest ROI

${context.totalCustomers > 0 ? `With your current ${context.roi?.toFixed(1)}% ROI, ${context.roi > 200 ? 'you\'re significantly exceeding industry benchmarks. Focus on scaling successful strategies.' : 'there\'s opportunity to improve through better targeting and message optimization.'}` : 'Track all metrics in the Analytics Dashboard once you launch campaigns.'}`;

      } else if (lowerMessage.includes('analytics') || lowerMessage.includes('dashboard') || lowerMessage.includes('metrics') || lowerMessage.includes('report')) {
        aiResponse = `The Analytics Dashboard provides comprehensive insights into your marketing performance.

Key metrics available:
- Campaign Performance: sent, delivered, opened, clicked, converted
- Revenue Analytics: total revenue, costs, ROI, revenue trends
- Customer Insights: total customers, active rate, churn analysis
- Engagement Metrics: CTR, conversion rates, response times
- Sentiment Analysis: positive, neutral, negative customer sentiment
- A/B Test Results: statistical significance, winning variations

${context.totalCustomers > 0 ? `Current overview: ${context.totalCustomers} customers, $${context.totalRevenue?.toFixed(2)} revenue, ${context.roi?.toFixed(1)}% ROI, ${context.avgCTR?.toFixed(1)}% CTR.` : ''}

Features:
- Real-time data updates from all campaigns
- Visual charts and graphs for trend analysis  
- Export capabilities for reporting
- Comparative analysis across campaigns
- Customer cohort analysis

${context.totalCustomers === 0 ? 'Generate sample data to see the full analytics capabilities with realistic metrics and visualizations.' : 'Navigate to the Analytics section to dive deeper into your performance data and identify optimization opportunities.'}`;

      } else if (lowerMessage.includes('help') || lowerMessage.includes('what can you') || lowerMessage.includes('how') || lowerMessage.includes('start') || lowerMessage.includes('guide')) {
        aiResponse = `I'm your AI marketing assistant for this WhatsApp Marketing Platform. ${context.totalCustomers > 0 ? `I have access to your live data: ${context.totalCustomers} customers, $${context.totalRevenue?.toFixed(2)} revenue, ${context.roi?.toFixed(1)}% ROI.` : 'I can help you understand and use all platform features.'}

I can help with:
- A/B Testing: How to set up tests, interpret results, optimize variations
- Campaign Strategy: Creating effective campaigns, targeting, timing, messaging
- Customer Segmentation: Identifying high-value customers, creating audiences
- Analytics: Understanding metrics, ROI analysis, performance trends  
- Data Management: Using datasets, sample generation, customer insights
- Platform Features: Navigation, tools, best practices

Common questions I can answer:
"How do I create an A/B test?"
"What does the dataset include?"
"How can I improve my ROI?"
"Which customers should I target?"
"What metrics should I track?"
"How does sentiment analysis work?"

${context.totalCustomers === 0 ? 'To get started: Use the Sample Data Generator to create customer profiles, then create your first campaign or A/B test. I\'ll provide guidance at each step!' : 'What specific aspect of your marketing would you like to explore or optimize today?'}`;

      } else {
        aiResponse = `I'm your AI assistant specializing in WhatsApp marketing, A/B testing, customer analytics, and campaign optimization for this platform.

${context.totalCustomers > 0 ? `Your current stats: ${context.totalCustomers} customers, $${context.totalRevenue?.toFixed(2)} revenue, ${context.roi?.toFixed(1)}% ROI, ${context.avgCTR?.toFixed(1)}% CTR, with ${context.sentiment.positive} positive customer responses.` : 'You haven\'t added any customer data yet.'}

I can help you with:
- Creating and optimizing marketing campaigns
- Setting up A/B tests to improve performance
- Understanding your customer data and segmentation
- Analyzing campaign metrics and ROI
- Developing targeting strategies
- Interpreting analytics and trends

Try asking me:
- "How do I set up an A/B test?"
- "What customer segments should I target?"
- "How can I improve my campaign ROI?"
- "Explain the dataset features"
- "What are best practices for WhatsApp marketing?"

${context.totalCustomers === 0 ? 'Want to get started? Try generating sample customer data or ask me about any platform feature!' : 'What would you like to know more about?'}`;
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