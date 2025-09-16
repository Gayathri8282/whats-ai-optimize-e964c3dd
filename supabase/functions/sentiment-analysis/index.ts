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
    const { text } = await req.json();

    if (!text) {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Analyzing sentiment for text:', text);

    const response = await fetch('https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: text
      }),
    });

    if (!response.ok) {
      console.error('Hugging Face API error:', response.status, response.statusText);
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform Hugging Face response to our format
    const result = data[0];
    let sentiment = 'neutral';
    let confidence = 0.5;
    
    if (result && result.length > 0) {
      const topResult = result.reduce((max: any, curr: any) => curr.score > max.score ? curr : max);
      confidence = topResult.score;
      
      if (topResult.label === 'LABEL_0') sentiment = 'negative';
      else if (topResult.label === 'LABEL_1') sentiment = 'neutral';
      else if (topResult.label === 'LABEL_2') sentiment = 'positive';
    }

    const analysis = {
      sentiment,
      confidence,
      explanation: `Text classified as ${sentiment} with ${Math.round(confidence * 100)}% confidence`
    };

    console.log('Sentiment analysis result:', analysis);
    
    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in sentiment-analysis function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      sentiment: 'neutral',
      confidence: 0,
      explanation: 'Failed to analyze sentiment'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});