import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PageVisitEvent {
  eventType: 'page_visit';
  pagePath: string;
  variationId?: string;
  sessionId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  referrer?: string;
  userAgent?: string;
}

interface ClickEvent {
  eventType: 'click_event';
  buttonId: string;
  buttonText?: string;
  pagePath: string;
  variationId?: string;
  sessionId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  userAgent?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const event: PageVisitEvent | ClickEvent = await req.json();
    console.log('Received tracking event:', event);

    if (event.eventType === 'page_visit') {
      const { error } = await supabase
        .from('page_visits')
        .insert({
          page_path: event.pagePath,
          variation_id: event.variationId || null,
          session_id: event.sessionId || null,
          utm_source: event.utmSource || null,
          utm_medium: event.utmMedium || null,
          utm_campaign: event.utmCampaign || null,
          utm_content: event.utmContent || null,
          utm_term: event.utmTerm || null,
          referrer: event.referrer || null,
          user_agent: event.userAgent || null
        });

      if (error) {
        console.error('Error inserting page visit:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to track page visit', details: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Page visit tracked successfully');
      return new Response(
        JSON.stringify({ success: true, message: 'Page visit tracked' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (event.eventType === 'click_event') {
      const { error } = await supabase
        .from('click_events')
        .insert({
          button_id: event.buttonId,
          button_text: event.buttonText || null,
          page_path: event.pagePath,
          variation_id: event.variationId || null,
          session_id: event.sessionId || null,
          utm_source: event.utmSource || null,
          utm_medium: event.utmMedium || null,
          utm_campaign: event.utmCampaign || null,
          user_agent: event.userAgent || null
        });

      if (error) {
        console.error('Error inserting click event:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to track click event', details: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Click event tracked successfully');
      return new Response(
        JSON.stringify({ success: true, message: 'Click event tracked' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid event type' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing tracking event:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
