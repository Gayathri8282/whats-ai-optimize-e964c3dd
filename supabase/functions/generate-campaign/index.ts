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

    const prompt = `Generate a ${campaignType} WhatsApp marketing campaign for ${targetAudience}.

Business info: ${businessInfo || 'Not provided'}
Goals: ${goals || 'Increase engagement and conversions'}
Tone: ${tone || 'professional and friendly'}

Create an effective campaign with:
- A catchy campaign name
- A main message template (keep it concise and personal for WhatsApp)
- Include clear call-to-action
- Use emojis appropriately
- Follow WhatsApp marketing best practices

Example format:
Campaign Name: "New Customer Welcome"
Message: "Hi [Name]! 👋 Welcome to [Business]! We're excited to have you. Here's 20% off your first order: [LINK] Reply STOP to opt-out."`;

    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-large', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: 500,
          temperature: 0.7,
          do_sample: true
        }
      }),
    });

    if (!response.ok) {
      console.error('Hugging Face API error:', response.status, response.statusText);
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const data = await response.json();
    let generatedContent = '';
    
    if (data && data[0] && data[0].generated_text) {
      generatedContent = data[0].generated_text;
    } else {
      // Fallback content generation
      generatedContent = `Campaign Name: ${campaignType} Campaign for ${targetAudience}
      
Message Template: Hi there! 👋 We have exciting ${campaignType} news for our ${targetAudience} customers. 

${campaignType === 'promotional' ? '🎉 Special offer just for you!' : ''}
${campaignType === 'announcement' ? '📢 Important update!' : ''}
${campaignType === 'survey' ? '🗣️ We value your opinion!' : ''}

Tap here to learn more: [LINK]

Reply STOP to unsubscribe.`;
    }

    // Parse and structure the response
    const lines = generatedContent.split('\n').filter(line => line.trim());
    let name = `${campaignType} Campaign for ${targetAudience}`;
    let messageTemplate = generatedContent;
    
    // Extract campaign name if present
    const nameMatch = generatedContent.match(/Campaign Name:?\s*(.+)/i);
    if (nameMatch) {
      name = nameMatch[1].replace(/"/g, '').trim();
    }
    
    // Extract message template if present
    const messageMatch = generatedContent.match(/Message:?\s*(.+?)(?=\n\n|$)/is);
    if (messageMatch) {
      messageTemplate = messageMatch[1].trim();
    }

    const structuredResponse = {
      name,
      messageTemplate,
      variations: [
        messageTemplate,
        messageTemplate.replace('Hi there!', 'Hello!'),
        messageTemplate.replace('👋', '✨')
      ],
      bestPractices: [
        "Keep messages personal and engaging",
        "Include clear call-to-action", 
        "Test different variations",
        "Use emojis appropriately"
      ],
      estimatedEngagement: { 
        openRate: "65%", 
        responseRate: "15%", 
        clickRate: "8%" 
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