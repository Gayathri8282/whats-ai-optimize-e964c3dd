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
    const { task, campaign, product, variants, metrics, context } = await req.json();
    
    console.log('A/B Testing Agent - Received request:', { task, campaign, product, context });
    
    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
    const GROQ_MODEL = 'llama-3.1-70b-versatile'; // Using available model
    
    if (!GROQ_API_KEY) {
      console.error('GROQ_API_KEY not found');
      return new Response(JSON.stringify({ error: 'GROQ API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let prompt;

    if (task === 'generate_variants') {
      prompt = `Generate 3 WhatsApp marketing message variants for this campaign and product:

Campaign: ${campaign.name} - ${campaign.description}
Target Audience: ${context.target_audience}
Platform: ${context.platform}

Product Details:
- Name: ${product?.name || 'Not specified'}
- Description: ${product?.description || 'Not specified'}
- Price: ${product?.price || 'Not specified'}
- Key Features: ${product?.features || 'Not specified'}
- Benefits: ${product?.benefits || 'Not specified'}
- Special Offer: ${product?.offer || 'Not specified'}

Instructions:
- Create compelling WhatsApp messages that highlight the product's value
- Include the special offer/promotion if provided
- Keep messages under 160 characters for optimal WhatsApp performance
- Use emojis appropriately
- Include a clear call-to-action
- Make each variant unique in tone and approach
- Focus on the product name, benefits, and offer

Return ONLY JSON format: {"variants": ["variant1", "variant2", "variant3"]}`;
    } else {
      prompt = `Analyze A/B test performance and recommend traffic allocation:
Variants: ${JSON.stringify(variants)}
Metrics: ${JSON.stringify(metrics)}
Context: ${JSON.stringify(context)}

Return JSON with recommendations for traffic allocation and next steps.`;
    }

    console.log('Generated prompt:', prompt);

    const groqPayload = {
      model: GROQ_MODEL,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    };

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify(groqPayload),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('GROQ API Error:', error);
      return new Response(JSON.stringify({ error: `GROQ API Error: ${error}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const data = await response.json();
    console.log('GROQ API response:', JSON.stringify(data, null, 2));
    
    // Extract the generated content
    const generatedContent = data.choices[0]?.message?.content;
    console.log('Generated content:', generatedContent);
    
    if (!generatedContent) {
      return new Response(JSON.stringify({ error: 'No content generated from GROQ API' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    try {
      // Clean the content by removing markdown code blocks
      let cleanContent = generatedContent.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      console.log('Cleaned content for parsing:', cleanContent);
      
      // Parse the JSON response from the LLM
      const parsedVariants = JSON.parse(cleanContent);
      
      return new Response(JSON.stringify(parsedVariants), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.log('JSON parse error:', parseError.message);
      // If JSON parsing fails, return the raw content
      return new Response(JSON.stringify({ 
        variants: [generatedContent], 
        note: 'Content was not in expected JSON format',
        raw_content: generatedContent 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in ab-testing-agent function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});