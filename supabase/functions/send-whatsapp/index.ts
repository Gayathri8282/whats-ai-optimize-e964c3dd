import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface SendWhatsAppRequest {
  userId: string;
  campaignName: string;
  messageTemplate: string;
  customerIds?: string[];
  sendToAll?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, campaignName, messageTemplate, customerIds, sendToAll }: SendWhatsAppRequest = await req.json();
    
    console.log('WhatsApp campaign request:', { campaignName, customerCount: customerIds?.length || 'all' });

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch customers based on selection
    let customersQuery = supabase
      .from('customers')
      .select('id, full_name, phone, email, location, total_spent, campaigns_accepted, opt_out')
      .eq('user_id', userId)
      .eq('opt_out', false); // Only send to customers who haven't opted out

    if (!sendToAll && customerIds && customerIds.length > 0) {
      customersQuery = customersQuery.in('id', customerIds);
    }

    const { data: customers, error: customersError } = await customersQuery;

    if (customersError) throw customersError;

    if (!customers || customers.length === 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No eligible customers found (may have opted out)' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Sending WhatsApp to ${customers.length} customers`);

    const results = {
      total: customers.length,
      sent: 0,
      failed: 0,
      optedOut: 0,
      details: [] as any[]
    };

    // Send WhatsApp messages to each customer
    for (const customer of customers) {
      try {
        // Skip if customer opted out (double check)
        if (customer.opt_out) {
          results.optedOut++;
          await logCampaignResult(supabase, {
            userId,
            campaignName,
            customerId: customer.id,
            channel: 'whatsapp',
            recipientPhone: customer.phone,
            messageContent: personalizeMessage(messageTemplate, customer),
            status: 'opt_out'
          });
          continue;
        }

        // Personalize message for this customer
        const personalizedMessage = personalizeMessage(messageTemplate, customer);
        
        // Add opt-out footer for compliance
        const finalMessage = `${personalizedMessage}\n\nReply STOP to opt out from future messages.`;

        // Format phone number for WhatsApp
        const formattedPhone = formatPhoneForWhatsApp(customer.phone);

        // Send via Twilio WhatsApp API
        const twilioResponse = await fetch('https://api.twilio.com/2010-04-01/Accounts/' + twilioSid + '/Messages.json', {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(twilioSid + ':' + twilioToken),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: 'whatsapp:+14155238886', // Twilio WhatsApp sandbox number
            To: `whatsapp:${formattedPhone}`,
            Body: finalMessage,
          }).toString(),
        });

        const twilioResult = await twilioResponse.json();

        if (twilioResponse.ok && twilioResult.sid) {
          results.sent++;
          
          // Log successful send
          await logCampaignResult(supabase, {
            userId,
            campaignName,
            customerId: customer.id,
            channel: 'whatsapp',
            recipientPhone: customer.phone,
            messageContent: finalMessage,
            status: 'sent',
            deliveryId: twilioResult.sid
          });

          results.details.push({
            customer: customer.full_name,
            phone: customer.phone,
            status: 'sent',
            messageId: twilioResult.sid
          });

        } else {
          results.failed++;
          const errorMsg = twilioResult.message || 'Failed to send WhatsApp message';
          
          // Log failed send
          await logCampaignResult(supabase, {
            userId,
            campaignName,
            customerId: customer.id,
            channel: 'whatsapp',
            recipientPhone: customer.phone,
            messageContent: finalMessage,
            status: 'failed',
            errorMessage: errorMsg
          });

          results.details.push({
            customer: customer.full_name,
            phone: customer.phone,
            status: 'failed',
            error: errorMsg
          });
        }

      } catch (error) {
        results.failed++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        
        console.error(`Failed to send WhatsApp to ${customer.full_name}:`, errorMsg);

        // Log failed send
        await logCampaignResult(supabase, {
          userId,
          campaignName,
          customerId: customer.id,
          channel: 'whatsapp',
          recipientPhone: customer.phone,
          messageContent: personalizeMessage(messageTemplate, customer),
          status: 'failed',
          errorMessage: errorMsg
        });

        results.details.push({
          customer: customer.full_name,
          phone: customer.phone,
          status: 'failed',
          error: errorMsg
        });
      }
    }

    console.log('WhatsApp campaign results:', results);

    return new Response(JSON.stringify({
      success: true,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-whatsapp function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper functions
function personalizeMessage(template: string, customer: any): string {
  return template
    .replace(/\{\{customer_name\}\}/g, customer.full_name || 'Valued Customer')
    .replace(/\{\{company_name\}\}/g, 'Your Company') // You can make this configurable
    .replace(/\{\{location\}\}/g, customer.location || '')
    .replace(/\{\{total_spent\}\}/g, `$${customer.total_spent || 0}`)
    .replace(/\{\{campaigns_accepted\}\}/g, customer.campaigns_accepted || 0);
}

function formatPhoneForWhatsApp(phone: string): string {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Add country code if missing (assuming US +1)
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('+')) {
    return phone;
  } else {
    return `+${cleaned}`;
  }
}

async function logCampaignResult(supabase: any, data: {
  userId: string;
  campaignName: string;
  customerId: string;
  channel: string;
  recipientPhone: string;
  messageContent: string;
  status: string;
  deliveryId?: string;
  errorMessage?: string;
}) {
  try {
    await supabase.from('campaign_logs').insert({
      user_id: data.userId,
      campaign_name: data.campaignName,
      customer_id: data.customerId,
      channel: data.channel,
      recipient_phone: data.recipientPhone,
      message_content: data.messageContent,
      status: data.status,
      delivery_id: data.deliveryId,
      error_message: data.errorMessage
    });
  } catch (error) {
    console.error('Failed to log campaign result:', error);
  }
}