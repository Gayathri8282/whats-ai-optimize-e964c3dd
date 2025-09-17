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

    console.log('🎯 Starting A/B test:', testId);

    // Get test details first
    const { data: testData, error: testError } = await supabase
      .from('ab_tests')
      .select('*')
      .eq('id', testId)
      .single();

    if (testError || !testData) {
      console.error('❌ Test lookup failed:', testError);
      throw new Error(`A/B test not found: ${testError?.message || 'Unknown error'}`);
    }

    console.log('📋 Test data found:', JSON.stringify(testData, null, 2));

    // Get campaign details separately
    const { data: campaignData, error: campaignError } = await supabase
      .from('campaigns')
      .select('user_id, target_audience')
      .eq('id', testData.campaign_id)
      .single();

    if (campaignError || !campaignData) {
      console.error('❌ Campaign lookup failed:', campaignError);
      throw new Error(`Campaign not found: ${campaignError?.message || 'Unknown error'}`);
    }

    console.log('📋 Campaign data found:', JSON.stringify(campaignData, null, 2));

    // Get variations for this test
    const { data: variations, error: variationsError } = await supabase
      .from('ab_test_variations')
      .select('*')
      .eq('ab_test_id', testId);

    if (variationsError || !variations || variations.length === 0) {
      console.error('❌ Variations lookup failed:', variationsError);
      throw new Error(`No variations found for this test: ${variationsError?.message || 'No variations exist'}`);
    }

    // Get eligible customers based on target audience
    const userId = campaignData.user_id;
    
    if (!userId) {
      throw new Error('Could not determine user ID from campaign data');
    }
    
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', userId)
      .eq('opt_out', false)
      .limit(testData.customer_count || 100);

    if (customersError || !customers || customers.length === 0) {
      console.error('❌ Customers lookup failed:', customersError);
      throw new Error(`No eligible customers found. Please seed test data first: ${customersError?.message || 'No customers exist'}`);
    }

    // Randomly assign customers to variations
    const shuffledCustomers = customers.sort(() => Math.random() - 0.5);
    const customersPerVariation = Math.floor(shuffledCustomers.length / variations.length);
    
    // Create ab_test_results entries for customer assignments
    const results = [];
    for (let i = 0; i < variations.length; i++) {
      const variation = variations[i];
      const startIndex = i * customersPerVariation;
      const endIndex = i === variations.length - 1 ? shuffledCustomers.length : (i + 1) * customersPerVariation;
      const assignedCustomers = shuffledCustomers.slice(startIndex, endIndex);

      for (const customer of assignedCustomers) {
        results.push({
          ab_test_id: testId,
          variation_id: variation.id,
          customer_id: customer.id,
          assigned_at: new Date().toISOString()
        });
      }
    }

    // Insert customer assignments
    const { error: resultsError } = await supabase
      .from('ab_test_results')
      .insert(results);

    if (resultsError) {
      console.error('❌ Failed to insert customer assignments:', resultsError);
      throw new Error(`Failed to assign customers to test: ${resultsError.message}`);
    }

    // Simulate sending messages and track metrics with more varied results
    for (const variation of variations) {
      const variationResults = results.filter(r => r.variation_id === variation.id);
      const totalAssigned = variationResults.length;
      
      // Create more varied performance based on variation name to simulate A/B differences
      const baseMultiplier = variation.variation_name === 'A' ? 1.0 : 
                           variation.variation_name === 'B' ? 1.15 : 1.05;
      
      // Simulate message sending with realistic but varied rates
      const sentRate = Math.max(0.80, Math.min(0.95, 0.85 + (Math.random() - 0.5) * 0.2)); // 80-95%
      const openRate = Math.max(0.20, Math.min(0.65, (0.35 + (Math.random() - 0.5) * 0.3) * baseMultiplier)); // 20-65%
      const clickRate = Math.max(0.08, Math.min(0.25, (0.12 + (Math.random() - 0.5) * 0.1) * baseMultiplier)); // 8-25% of opens
      const conversionRate = Math.max(0.05, Math.min(0.15, (0.08 + (Math.random() - 0.5) * 0.06) * baseMultiplier)); // 5-15% of clicks
      const replyRate = Math.max(0.02, Math.min(0.08, (0.03 + (Math.random() - 0.5) * 0.04) * baseMultiplier)); // 2-8%

      const sentCount = Math.floor(totalAssigned * sentRate);
      const openedCount = Math.floor(sentCount * openRate);
      const clickedCount = Math.floor(openedCount * clickRate);
      const convertedCount = Math.floor(clickedCount * conversionRate);
      const repliedCount = Math.floor(sentCount * replyRate);
      
      // Calculate CTR (based on sent, not opens) and conversion rate for more realistic metrics
      const ctr = sentCount > 0 ? (clickedCount / sentCount) * 100 : 0;
      const convRate = clickedCount > 0 ? (convertedCount / clickedCount) * 100 : 0;

      // Update variation metrics
      const { error: updateError } = await supabase
        .from('ab_test_variations')
        .update({
          audience_count: totalAssigned,
          sent_count: sentCount,
          opened_count: openedCount,
          clicked_count: clickedCount,
          conversion_count: convertedCount,
          reply_count: repliedCount,
          read_count: openedCount,
          ctr: parseFloat(ctr.toFixed(2)),
          conversion_rate: parseFloat(convRate.toFixed(2))
        })
        .eq('id', variation.id);

      if (updateError) {
        console.error('Error updating variation metrics:', updateError);
      }

      // Update individual customer results to simulate realistic behavior
      const customerUpdates = [];
      const sortedResults = variationResults.sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < sortedResults.length; i++) {
        const result = sortedResults[i];
        const update: any = { id: result.id };
        
        if (i < sentCount) {
          update.message_sent = true;
          update.message_sent_at = new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString();
          
          if (i < openedCount) {
            update.opened = true;
            update.opened_at = new Date(Date.now() - Math.random() * 45 * 60 * 1000).toISOString();
            
            if (i < clickedCount) {
              update.clicked = true;
              update.clicked_at = new Date(Date.now() - Math.random() * 30 * 60 * 1000).toISOString();
              
              if (i < convertedCount) {
                update.converted = true;
                update.converted_at = new Date(Date.now() - Math.random() * 15 * 60 * 1000).toISOString();
                update.revenue = Math.floor(Math.random() * 200) + 50; // $50-250 revenue per conversion
              }
            }
          }
          
          if (i < repliedCount) {
            update.replied = true;
            update.replied_at = new Date(Date.now() - Math.random() * 40 * 60 * 1000).toISOString();
          }
        }
        
        customerUpdates.push(update);
      }

      // Batch update customer results - Fixed customer assignment logic
      for (let j = 0; j < customerUpdates.length; j++) {
        const customerUpdate = customerUpdates[j];
        const originalResult = sortedResults[j];
        
        if (originalResult && customerUpdate) {
          const { id, ...updateData } = customerUpdate;
          const { error: updateResultError } = await supabase
            .from('ab_test_results')
            .update(updateData)
            .eq('ab_test_id', testId)
            .eq('variation_id', variation.id)
            .eq('customer_id', originalResult.customer_id);
            
          if (updateResultError) {
            console.error('Error updating customer result:', updateResultError);
          }
        }
      }
    }

    // Determine winner and update test status
    const updatedVariations = await supabase
      .from('ab_test_variations')
      .select('*')
      .eq('ab_test_id', testId)
      .order('ctr', { ascending: false });

    if (updatedVariations.data && updatedVariations.data.length >= 2) {
      const [winner, ...others] = updatedVariations.data;
      const ctrDiff = winner.ctr - (others[0]?.ctr || 0);
      const confidence = Math.min(95, 60 + (ctrDiff * 3)); // Simplified confidence calculation
      
      // Mark winner
      await supabase
        .from('ab_test_variations')
        .update({ is_winner: true })
        .eq('id', winner.id);

      // Update test with results
      await supabase
        .from('ab_tests')
        .update({
          status: 'running',
          started_at: new Date().toISOString(),
          winner_variation: winner.variation_name,
          confidence_level: parseFloat(confidence.toFixed(1))
        })
        .eq('id', testId);
    }

    console.log('✅ A/B test started successfully with real customer assignments');
    console.log('👥 User ID:', userId);
    console.log('📈 Total customers assigned:', results.length);
    console.log('🎯 Test variations:', variations.length);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'A/B test started successfully with real customer data',
      customersAssigned: results.length
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