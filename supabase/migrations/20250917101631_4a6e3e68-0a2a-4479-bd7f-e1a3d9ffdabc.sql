-- Enable RLS on campaign_metrics and contacts tables that were missing RLS
ALTER TABLE public.campaign_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Create policies for campaign_metrics
CREATE POLICY "Users can view metrics for their campaigns" 
ON public.campaign_metrics 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.campaigns 
  WHERE campaigns.id = campaign_metrics.campaign_id 
  AND campaigns.user_id = auth.uid()
));

CREATE POLICY "Users can create metrics for their campaigns" 
ON public.campaign_metrics 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.campaigns 
  WHERE campaigns.id = campaign_metrics.campaign_id 
  AND campaigns.user_id = auth.uid()
));

CREATE POLICY "Users can update metrics for their campaigns" 
ON public.campaign_metrics 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.campaigns 
  WHERE campaigns.id = campaign_metrics.campaign_id 
  AND campaigns.user_id = auth.uid()
));

-- Create policies for contacts (make them user-scoped)
-- First, add user_id column to contacts if it doesn't exist
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS user_id UUID;

-- Update existing contacts to have user_id (if any exist)
UPDATE public.contacts SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;

-- Now make user_id required
ALTER TABLE public.contacts ALTER COLUMN user_id SET NOT NULL;

-- Create policies for contacts
CREATE POLICY "Users can view their own contacts" 
ON public.contacts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contacts" 
ON public.contacts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts" 
ON public.contacts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts" 
ON public.contacts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Fix the function search path security issue
CREATE OR REPLACE FUNCTION public.compute_campaign_analytics(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    total_customers INTEGER;
    total_revenue DECIMAL;
    total_cost DECIMAL;
    roi_value DECIMAL;
    avg_ctr DECIMAL;
    sentiment_stats JSONB;
BEGIN
    -- Get customer counts and metrics
    SELECT 
        COUNT(*),
        SUM(total_spent),
        SUM(z_cost_contact * campaigns_accepted),
        AVG(CASE WHEN campaigns_accepted > 0 THEN campaigns_accepted::DECIMAL / 5.0 * 100 ELSE 0 END)
    INTO total_customers, total_revenue, total_cost, avg_ctr
    FROM public.customers 
    WHERE user_id = user_uuid;
    
    -- Calculate ROI
    roi_value := CASE 
        WHEN total_cost > 0 THEN (total_revenue - total_cost) / total_cost * 100
        ELSE 0 
    END;
    
    -- Compute sentiment distribution (simulate based on complaints)
    WITH sentiment_calc AS (
        SELECT 
            CASE 
                WHEN complain THEN 'negative'
                WHEN campaigns_accepted >= 3 THEN 'positive'
                ELSE 'neutral'
            END as sentiment
        FROM public.customers 
        WHERE user_id = user_uuid
    )
    SELECT jsonb_build_object(
        'positive', COUNT(*) FILTER (WHERE sentiment = 'positive'),
        'neutral', COUNT(*) FILTER (WHERE sentiment = 'neutral'),
        'negative', COUNT(*) FILTER (WHERE sentiment = 'negative')
    ) INTO sentiment_stats
    FROM sentiment_calc;
    
    -- Build result
    result := jsonb_build_object(
        'total_customers', COALESCE(total_customers, 0),
        'total_revenue', COALESCE(total_revenue, 0),
        'total_cost', COALESCE(total_cost, 0),
        'roi', COALESCE(roi_value, 0),
        'avg_ctr', COALESCE(avg_ctr, 0),
        'sentiment', sentiment_stats,
        'computed_at', extract(epoch from now())
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;