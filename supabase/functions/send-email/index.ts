import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resendApiKey = Deno.env.get('RESEND_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Input validation  
interface SendEmailRequest {
  campaignName: string;
  recipients: Array<{ email: string; name: string; customerId: string }>;
  messageTemplate: string;
}

function validateEmailInput(body: any): { valid: boolean; error?: string; data?: SendEmailRequest } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }
  
  if (!body.campaignName || typeof body.campaignName !== 'string') {
    return { valid: false, error: 'Campaign name is required and must be a string' };
  }
  
  if (body.campaignName.length > 200) {
    return { valid: false, error: 'Campaign name must be less than 200 characters' };
  }
  
  if (!body.messageTemplate || typeof body.messageTemplate !== 'string') {
    return { valid: false, error: 'Message template is required and must be a string' };
  }
  
  if (body.messageTemplate.length > 10000) {
    return { valid: false, error: 'Message template must be less than 10000 characters' };
  }
  
  if (!body.subject || typeof body.subject !== 'string') {
    return { valid: false, error: 'Subject is required and must be a string' };
  }
  
  if (body.subject.length > 200) {
    return { valid: false, error: 'Subject must be less than 200 characters' };
  }
  
  if (body.customerIds && !Array.isArray(body.customerIds)) {
    return { valid: false, error: 'Customer IDs must be an array' };
  }
  
  return { 
    valid: true, 
    data: {
      campaignName: body.campaignName,
      messageTemplate: body.messageTemplate,
      subject: body.subject,
      customerIds: body.customerIds,
      sendToAll: body.sendToAll
    }
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = user.id; // Use authenticated user's ID

    // Validate input
    const body = await req.json();
    const validation = validateEmailInput(body);
    
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { campaignName, messageTemplate, subject, customerIds, sendToAll } = validation.data!;
    
    console.log('Email campaign request for user:', userId, 'Campaign:', campaignName, 'Subject:', subject, 'Customer count:', customerIds?.length || 'all');

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

    console.log(`Sending emails to ${customers.length} customers`);

    const results = {
      total: customers.length,
      sent: 0,
      failed: 0,
      optedOut: 0,
      details: [] as any[]
    };

    // Send emails to each customer
    for (const customer of customers) {
      try {
        // Skip if customer opted out (double check)
        if (customer.opt_out) {
          results.optedOut++;
          await logCampaignResult(supabase, {
            userId,
            campaignName,
            customerId: customer.id,
            channel: 'email',
            recipientEmail: customer.email,
            messageContent: personalizeMessage(messageTemplate, customer),
            status: 'opt_out'
          });
          continue;
        }

        // Personalize message and subject for this customer
        const personalizedMessage = personalizeMessage(messageTemplate, customer);
        const personalizedSubject = personalizeMessage(subject, customer);
        
        // Create HTML email content with opt-out footer
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="white-space: pre-line; margin-bottom: 30px;">
              ${personalizedMessage.replace(/\n/g, '<br>')}
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <div style="font-size: 12px; color: #666; text-align: center;">
              <p>You received this email because you're a valued customer.</p>
              <p>If you no longer wish to receive these emails, please reply with "UNSUBSCRIBE" to opt out.</p>
            </div>
          </div>
        `;

        // Send via Resend API
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Marketing <onboarding@resend.dev>', // Replace with your verified domain
            to: [customer.email],
            subject: personalizedSubject,
            html: emailHtml,
          }),
        });

        const resendResult = await resendResponse.json();

        if (resendResponse.ok && resendResult.id) {
          results.sent++;
          
          // Log successful send
          await logCampaignResult(supabase, {
            userId,
            campaignName,
            customerId: customer.id,
            channel: 'email',
            recipientEmail: customer.email,
            messageContent: personalizedMessage,
            status: 'sent',
            deliveryId: resendResult.id
          });

          results.details.push({
            customer: customer.full_name,
            email: customer.email,
            status: 'sent',
            messageId: resendResult.id
          });

        } else {
          results.failed++;
          const errorMsg = resendResult.message || 'Failed to send email';
          
          // Log failed send
          await logCampaignResult(supabase, {
            userId,
            campaignName,
            customerId: customer.id,
            channel: 'email',
            recipientEmail: customer.email,
            messageContent: personalizedMessage,
            status: 'failed',
            errorMessage: errorMsg
          });

          results.details.push({
            customer: customer.full_name,
            email: customer.email,
            status: 'failed',
            error: errorMsg
          });
        }

      } catch (error) {
        results.failed++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        
        console.error(`Failed to send email to ${customer.full_name}:`, errorMsg);

        // Log failed send
        await logCampaignResult(supabase, {
          userId,
          campaignName,
          customerId: customer.id,
          channel: 'email',
          recipientEmail: customer.email,
          messageContent: personalizeMessage(messageTemplate, customer),
          status: 'failed',
          errorMessage: errorMsg
        });

        results.details.push({
          customer: customer.full_name,
          email: customer.email,
          status: 'failed',
          error: errorMsg
        });
      }
    }

    console.log('Email campaign results:', results);

    return new Response(JSON.stringify({
      success: true,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-email function:', error);
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
  // Get country name from country code if available
  const countryNames: Record<string, string> = {
    'US': 'United States', 'GB': 'United Kingdom', 'CA': 'Canada', 'IN': 'India',
    'CN': 'China', 'JP': 'Japan', 'DE': 'Germany', 'FR': 'France', 'BR': 'Brazil',
    'AU': 'Australia', 'IT': 'Italy', 'ES': 'Spain', 'NL': 'Netherlands',
    'KR': 'South Korea', 'SG': 'Singapore', 'MX': 'Mexico', 'RU': 'Russia'
  };

  const countryName = customer.country ? countryNames[customer.country] || customer.country : '';
  const cityName = customer.city || '';
  const fullLocation = customer.city && customer.country 
    ? `${customer.city}, ${countryName}`
    : customer.location || '';

  return template
    .replace(/\{\{customer_name\}\}/g, customer.full_name || 'Valued Customer')
    .replace(/\{\{company_name\}\}/g, 'Your Company') // You can make this configurable
    .replace(/\{\{location\}\}/g, fullLocation)
    .replace(/\{\{country\}\}/g, countryName)
    .replace(/\{\{city\}\}/g, cityName)
    .replace(/\{\{total_spent\}\}/g, `$${customer.total_spent || 0}`)
    .replace(/\{\{campaigns_accepted\}\}/g, customer.campaigns_accepted || 0);
}

async function logCampaignResult(supabase: any, data: {
  userId: string;
  campaignName: string;
  customerId: string;
  channel: string;
  recipientEmail: string;
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
      recipient_email: data.recipientEmail,
      message_content: data.messageContent,
      status: data.status,
      delivery_id: data.deliveryId,
      error_message: data.errorMessage
    });
  } catch (error) {
    console.error('Failed to log campaign result:', error);
  }
}