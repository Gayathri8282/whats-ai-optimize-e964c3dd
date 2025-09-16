import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { testId } = await req.json();

    if (!testId) {
      return new Response(JSON.stringify({ error: 'Test ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting A/B test:', testId);

    // Update test status to running
    const { error: updateError } = await supabase
      .from('ab_tests')
      .update({ status: 'running' })
      .eq('id', testId);

    if (updateError) {
      console.error('Error updating test status:', updateError);
      throw updateError;
    }

    // Simulate sending messages to variations and update metrics
    const { data: variations, error: variationsError } = await supabase
      .from('ab_test_variations')
      .select('*')
      .eq('ab_test_id', testId);

    if (variationsError) {
      console.error('Error fetching variations:', variationsError);
      throw variationsError;
    }

    // Simulate A/B test metrics for each variation
    for (const variation of variations || []) {
      const audienceCount = variation.audience_count || 1000;
      const sentCount = Math.floor(audienceCount * (0.8 + Math.random() * 0.2)); // 80-100% delivery
      const openedCount = Math.floor(sentCount * (0.3 + Math.random() * 0.4)); // 30-70% open rate
      const clickedCount = Math.floor(openedCount * (0.1 + Math.random() * 0.2)); // 10-30% click rate
      const conversionCount = Math.floor(clickedCount * (0.05 + Math.random() * 0.15)); // 5-20% conversion
      const ctr = sentCount > 0 ? ((clickedCount / sentCount) * 100) : 0;
      const conversionRate = clickedCount > 0 ? ((conversionCount / clickedCount) * 100) : 0;

      const { error: metricsError } = await supabase
        .from('ab_test_variations')
        .update({
          sent_count: sentCount,
          opened_count: openedCount,
          clicked_count: clickedCount,
          conversion_count: conversionCount,
          ctr: parseFloat(ctr.toFixed(2)),
          conversion_rate: parseFloat(conversionRate.toFixed(2))
        })
        .eq('id', variation.id);

      if (metricsError) {
        console.error('Error updating variation metrics:', metricsError);
        throw metricsError;
      }
    }

    // Calculate winner and confidence level
    const updatedVariations = await supabase
      .from('ab_test_variations')
      .select('*')
      .eq('ab_test_id', testId);

    if (updatedVariations.data && updatedVariations.data.length >= 2) {
      const [varA, varB] = updatedVariations.data;
      const ctrDiff = Math.abs(varA.ctr - varB.ctr);
      const winner = varA.ctr > varB.ctr ? varA.variation_name : varB.variation_name;
      const confidence = Math.min(95, 60 + (ctrDiff * 5)); // Simplified confidence calculation

      await supabase
        .from('ab_tests')
        .update({
          winner_variation: winner,
          confidence_level: parseFloat(confidence.toFixed(1)),
          status: confidence > 85 ? 'completed' : 'running'
        })
        .eq('id', testId);
    }

    console.log('A/B test started successfully');

    return new Response(JSON.stringify({ 
      success: true,
      message: 'A/B test started successfully' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in start-ab-test function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});