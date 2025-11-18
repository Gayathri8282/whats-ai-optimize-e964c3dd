import { supabase } from "@/integrations/supabase/client";

// Variation ID mapping for jewelry real-time test
const VARIATION_MAP: Record<string, string> = {
  'A': 'd987f4aa-7067-49a1-8c99-8c921562ab83',
  'B': '00e41b50-2c0f-4b05-a890-a0f79a58bdc0'
};

/**
 * Track page visit event
 */
export async function trackPageVisit(params: {
  pagePath: string;
  variant?: string;
  sessionId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  referrer?: string;
}) {
  const variationId = params.variant ? VARIATION_MAP[params.variant] : undefined;
  
  try {
    const { error } = await supabase.functions.invoke('track-event', {
      body: {
        eventType: 'page_visit',
        pagePath: params.pagePath,
        variationId,
        sessionId: params.sessionId,
        utmSource: params.utmSource,
        utmMedium: params.utmMedium,
        utmCampaign: params.utmCampaign,
        utmContent: params.utmContent,
        utmTerm: params.utmTerm,
        referrer: params.referrer,
        userAgent: navigator.userAgent
      }
    });

    if (error) {
      console.error('Error tracking page visit:', error);
    }
  } catch (error) {
    console.error('Error invoking track-event function:', error);
  }
}

/**
 * Track click event
 */
export async function trackClickEvent(params: {
  buttonId: string;
  buttonText?: string;
  pagePath: string;
  variant?: string;
  sessionId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}) {
  const variationId = params.variant ? VARIATION_MAP[params.variant] : undefined;
  
  try {
    const { error } = await supabase.functions.invoke('track-event', {
      body: {
        eventType: 'click_event',
        buttonId: params.buttonId,
        buttonText: params.buttonText,
        pagePath: params.pagePath,
        variationId,
        sessionId: params.sessionId,
        utmSource: params.utmSource,
        utmMedium: params.utmMedium,
        utmCampaign: params.utmCampaign,
        userAgent: navigator.userAgent
      }
    });

    if (error) {
      console.error('Error tracking click event:', error);
    }
  } catch (error) {
    console.error('Error invoking track-event function:', error);
  }
}
