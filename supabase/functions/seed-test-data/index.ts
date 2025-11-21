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
    const authHeader = req.headers.get('Authorization')!;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Seeding test data for user:', user.id);

    // Generate realistic customer data
    const customerNames = [
      'Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Emma Brown',
      'Frank Miller', 'Grace Lee', 'Henry Garcia', 'Ivy Martinez', 'Jack Anderson',
      'Kate Thompson', 'Liam White', 'Maya Rodriguez', 'Noah Clark', 'Olivia Lewis',
      'Paul Walker', 'Quinn Hall', 'Ruby Allen', 'Sam Young', 'Tara King',
      'Uma Hernandez', 'Victor Wright', 'Wendy Lopez', 'Xavier Hill', 'Yara Green'
    ];

    const locations = [
      'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
      'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
      'Austin, TX', 'Jacksonville, FL', 'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC'
    ];

    const segments = ['Premium Customers', 'New Customers', 'Loyal Customers', 'At-Risk Customers'];
    
    // Check if customers already exist for this user
    const { data: existingCustomers } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);

    let customerIds: string[] = [];

    if (!existingCustomers || existingCustomers.length === 0) {
      // Create customers
      const customers = customerNames.map((name, index) => {
        const emailDomain = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'][index % 4];
        const email = `${name.toLowerCase().replace(' ', '.')}@${emailDomain}`;
        const phone = `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`;
        const age = Math.floor(Math.random() * 50) + 20;
        const income = Math.floor(Math.random() * 80000) + 30000;
        const totalSpent = Math.floor(Math.random() * 5000) + 100;
        const campaignsAccepted = Math.floor(Math.random() * 6);
        
        return {
          user_id: user.id,
          full_name: name,
          email,
          phone,
          location: locations[index % locations.length],
          country: 'USA',
          city: locations[index % locations.length].split(', ')[0],
          age,
          income,
          total_spent: totalSpent,
          campaigns_accepted: campaignsAccepted,
          total_purchases: Math.floor(Math.random() * 20) + 1,
          recency: Math.floor(Math.random() * 365),
          mnt_wines: Math.floor(Math.random() * 1000),
          mnt_fruits: Math.floor(Math.random() * 500),
          mnt_meat_products: Math.floor(Math.random() * 800),
          mnt_gold_prods: Math.floor(Math.random() * 300),
          num_web_purchases: Math.floor(Math.random() * 10),
          num_catalog_purchases: Math.floor(Math.random() * 5),
          num_store_purchases: Math.floor(Math.random() * 15),
          num_web_visits_month: Math.floor(Math.random() * 20),
          complain: Math.random() < 0.1,
          response: Math.random() < 0.15,
          accepted_cmp1: Math.random() < 0.3,
          accepted_cmp2: Math.random() < 0.25,
          accepted_cmp3: Math.random() < 0.2,
          accepted_cmp4: Math.random() < 0.15,
          accepted_cmp5: Math.random() < 0.1,
          opt_out: Math.random() < 0.05,
          z_cost_contact: 3.0,
          z_revenue: 11.0,
          kidhome: Math.floor(Math.random() * 3),
          teenhome: Math.floor(Math.random() * 2)
        };
      });

      const { data: insertedCustomers, error: customerError } = await supabase
        .from('customers')
        .insert(customers)
        .select('id');

      if (customerError) {
        throw customerError;
      }

      customerIds = insertedCustomers.map(c => c.id);
      console.log(`Created ${customers.length} customers`);
    } else {
      // Get existing customer IDs
      const { data: allCustomers } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user.id);
      
      customerIds = allCustomers?.map(c => c.id) || [];
      console.log(`Using ${customerIds.length} existing customers`);
    }

    // Check if campaigns already exist
    const { data: existingCampaigns } = await supabase
      .from('campaigns')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);

    if (!existingCampaigns || existingCampaigns.length === 0) {
      // Create sample campaigns
      const campaigns = [
        {
          user_id: user.id,
          name: 'Summer Sale WhatsApp Campaign',
          type: 'whatsapp',
          status: 'completed',
          target_audience: 'Premium Customers',
          message_template: 'Hi {{customer_name}}! 🌞 Our Summer Sale is here with 30% off premium products. Don\'t miss out!',
          schedule_type: 'now',
          ai_optimization: true,
          audience_count: Math.floor(customerIds.length * 0.6),
          sent_count: Math.floor(customerIds.length * 0.55),
          opened_count: Math.floor(customerIds.length * 0.35),
          clicked_count: Math.floor(customerIds.length * 0.15),
          ctr: 15.2,
          start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          total_revenue: 8500,
          total_cost: 1200,
          roi: 608.33
        },
        {
          user_id: user.id,
          name: 'New Product Launch Email',
          type: 'email',
          status: 'running',
          target_audience: 'New Customers',
          message_template: 'Hello {{customer_name}}, discover our latest innovation! Perfect for your lifestyle in {{customer_location}}.',
          schedule_type: 'now',
          ai_optimization: true,
          audience_count: Math.floor(customerIds.length * 0.4),
          sent_count: Math.floor(customerIds.length * 0.35),
          opened_count: Math.floor(customerIds.length * 0.20),
          clicked_count: Math.floor(customerIds.length * 0.08),
          ctr: 8.9,
          start_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          total_revenue: 4200,
          total_cost: 800,
          roi: 425.0
        },
        {
          user_id: user.id,
          name: 'Loyalty Program Invitation',
          type: 'whatsapp',
          status: 'draft',
          target_audience: 'Loyal Customers',
          message_template: 'Hey {{customer_name}}! 🎉 You\'re invited to our exclusive loyalty program. Enjoy VIP benefits!',
          schedule_type: 'scheduled',
          scheduled_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          ai_optimization: false,
          audience_count: Math.floor(customerIds.length * 0.3),
          sent_count: 0,
          opened_count: 0,
          clicked_count: 0,
          ctr: 0,
          total_revenue: 0,
          total_cost: 0,
          roi: 0
        }
      ];

      const { data: insertedCampaigns, error: campaignError } = await supabase
        .from('campaigns')
        .insert(campaigns)
        .select('id, name, status');

      if (campaignError) {
        throw campaignError;
      }

      console.log(`Created ${campaigns.length} campaigns`);

      // Create campaign logs for completed campaigns
      const completedCampaigns = insertedCampaigns.filter(c => c.status === 'completed');
      
      for (const campaign of completedCampaigns) {
        const campaignData = campaigns.find(c => c.name === campaign.name);
        if (!campaignData) continue;

        // Create logs for sent messages
        const logsToCreate = [];
        const selectedCustomers = customerIds.slice(0, campaignData.sent_count);
        
        for (let i = 0; i < selectedCustomers.length; i++) {
          const customerId = selectedCustomers[i];
          const isOpened = i < campaignData.opened_count;
          const isClicked = i < campaignData.clicked_count;
          
          logsToCreate.push({
            user_id: user.id,
            campaign_name: campaign.name,
            customer_id: customerId,
            channel: campaignData.type,
            status: 'delivered',
            message_content: campaignData.message_template,
            sent_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            delivered_at: new Date(Date.now() - Math.random() * 6 * 24 * 60 * 60 * 1000).toISOString()
          });
        }

        if (logsToCreate.length > 0) {
          const { error: logsError } = await supabase
            .from('campaign_logs')
            .insert(logsToCreate);

          if (logsError) {
            console.error('Error creating campaign logs:', logsError);
          }
        }
      }
    }

    // Create product details if they don't exist
    const { data: existingProducts } = await supabase
      .from('product_details')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);

    if (!existingProducts || existingProducts.length === 0) {
      const products = [
        {
          user_id: user.id,
          name: 'Premium Wireless Headphones',
          description: 'High-quality noise-canceling wireless headphones with 30-hour battery life',
          price: '$199.99',
          features: 'Noise-canceling, 30-hour battery, Bluetooth 5.0, Quick charge',
          benefits: 'Crystal clear audio, All-day comfort, Seamless connectivity',
          offer: '30% off for limited time + Free shipping'
        },
        {
          user_id: user.id,
          name: 'Smart Fitness Tracker',
          description: 'Advanced fitness tracker with heart rate monitoring and GPS',
          price: '$149.99',
          features: 'Heart rate monitor, GPS, Sleep tracking, Water resistant',
          benefits: 'Track your health goals, Improve sleep quality, Stay motivated',
          offer: 'Buy 2 get 1 free + Extended warranty'
        }
      ];

      const { error: productError } = await supabase
        .from('product_details')
        .insert(products);

      if (productError) {
        throw productError;
      }

      console.log(`Created ${products.length} products`);
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Test data seeded successfully',
      customerCount: customerIds.length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in seed-test-data function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});