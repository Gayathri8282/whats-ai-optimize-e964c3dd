import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user } } = await supabase.auth.getUser(
      req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
    );

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate sample customer data based on iFood dataset structure
    const sampleCustomers = [];
    const names = [
      'John Smith', 'Maria Garcia', 'David Johnson', 'Sarah Williams', 'Michael Brown',
      'Lisa Davis', 'Robert Miller', 'Jennifer Wilson', 'William Moore', 'Elizabeth Taylor',
      'James Anderson', 'Patricia Thomas', 'Christopher Jackson', 'Linda White', 'Daniel Harris'
    ];
    
    const locations = [
      'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
      'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
      'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte'
    ];

    for (let i = 0; i < 50; i++) {
      const name = names[Math.floor(Math.random() * names.length)];
      const baseIncome = 30000 + Math.random() * 70000;
      const age = 25 + Math.floor(Math.random() * 40);
      
      // Realistic spending patterns
      const wineSpending = Math.random() * 500;
      const fruitSpending = Math.random() * 200;
      const meatSpending = Math.random() * 800;
      const goldSpending = Math.random() * 300;
      
      const customer = {
        user_id: user.id,
        full_name: name,
        email: `${name.toLowerCase().replace(' ', '.')}@email.com`,
        phone: `+1${Math.floor(Math.random() * 1000000000).toString().padStart(10, '0')}`,
        location: locations[Math.floor(Math.random() * locations.length)],
        age: age,
        income: Math.round(baseIncome),
        kidhome: Math.floor(Math.random() * 3),
        teenhome: Math.floor(Math.random() * 2),
        recency: Math.floor(Math.random() * 365),
        mnt_wines: Math.round(wineSpending * 100) / 100,
        mnt_fruits: Math.round(fruitSpending * 100) / 100,
        mnt_meat_products: Math.round(meatSpending * 100) / 100,
        mnt_gold_prods: Math.round(goldSpending * 100) / 100,
        num_web_purchases: Math.floor(Math.random() * 20),
        num_store_purchases: Math.floor(Math.random() * 15),
        num_catalog_purchases: Math.floor(Math.random() * 10),
        num_web_visits_month: Math.floor(Math.random() * 20),
        accepted_cmp1: Math.random() > 0.7,
        accepted_cmp2: Math.random() > 0.8,
        accepted_cmp3: Math.random() > 0.75,
        accepted_cmp4: Math.random() > 0.85,
        accepted_cmp5: Math.random() > 0.9,
        complain: Math.random() > 0.95,
        z_cost_contact: 3.0,
        z_revenue: 11.0,
        response: Math.random() > 0.5
      };
      
      sampleCustomers.push(customer);
    }

    // Insert sample customers
    const { error: insertError } = await supabase
      .from('customers')
      .insert(sampleCustomers);

    if (insertError) {
      throw insertError;
    }

    console.log(`Generated ${sampleCustomers.length} sample customers for user ${user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Generated ${sampleCustomers.length} sample customers`,
        customers_created: sampleCustomers.length 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error generating sample data:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});