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

    // Simple rule-based sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'awesome', 'fantastic', 'wonderful', 'perfect', 'love', 'like', 'happy', 'excited', 'best', 'incredible', 'outstanding', 'brilliant', 'superb', 'discount', 'off', 'sale', 'free', 'bonus', 'reward', 'win', 'congratulations'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'angry', 'frustrated', 'worst', 'disgusting', 'annoying', 'disappointing', 'useless', 'broken', 'failed', 'problem', 'issue', 'error', 'complaint', 'cancel'];
    
    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (positiveWords.some(pos => word.includes(pos))) positiveCount++;
      if (negativeWords.some(neg => word.includes(neg))) negativeCount++;
    });
    
    let sentiment = 'neutral';
    let confidence = 0.6;
    
    if (positiveCount > negativeCount) {
      sentiment = 'positive';
      confidence = Math.min(0.9, 0.6 + (positiveCount - negativeCount) * 0.1);
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
      confidence = Math.min(0.9, 0.6 + (negativeCount - positiveCount) * 0.1);
    }

    const analysis = {
      sentiment,
      confidence,
      explanation: `Text classified as ${sentiment} with ${Math.round(confidence * 100)}% confidence based on keyword analysis`
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