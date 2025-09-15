import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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

    const systemPrompt = `You are an expert WhatsApp marketing campaign generator. Create effective, engaging campaigns that follow best practices for WhatsApp marketing.

Key guidelines:
- Keep messages concise and personal (WhatsApp style)
- Include clear call-to-action
- Use emojis appropriately
- Follow WhatsApp marketing best practices
- Avoid spam-like content
- Focus on value and relationship building

Return a JSON response with:
- name: Campaign name
- messageTemplate: The main message template
- variations: Array of 2-3 message variations for A/B testing
- bestPractices: Array of tips for this campaign
- estimatedEngagement: Predicted engagement metrics`;

    const userPrompt = `Generate a ${campaignType} WhatsApp marketing campaign for ${targetAudience}.
    
Business info: ${businessInfo || 'Not provided'}
Goals: ${goals || 'Increase engagement and conversions'}
Tone: ${tone || 'professional and friendly'}

Create an effective campaign that will resonate with this audience.`;

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
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    try {
      const parsedContent = JSON.parse(generatedContent);
      console.log('Generated campaign:', parsedContent);
      
      return new Response(JSON.stringify(parsedContent), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', generatedContent);
      
      // Fallback response if OpenAI doesn't return valid JSON
      return new Response(JSON.stringify({
        name: `${campaignType} Campaign for ${targetAudience}`,
        messageTemplate: generatedContent,
        variations: [generatedContent],
        bestPractices: ["Keep messages personal and engaging", "Include clear call-to-action", "Test different variations"],
        estimatedEngagement: { openRate: "65%", responseRate: "15%", clickRate: "8%" }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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