-- Create customers table based on iFood dataset with PII augmentation (without vector for now)
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Original iFood dataset fields
  income DECIMAL(10,2),
  kidhome INTEGER DEFAULT 0,
  teenhome INTEGER DEFAULT 0,
  recency INTEGER,
  mnt_wines DECIMAL(8,2) DEFAULT 0,
  mnt_fruits DECIMAL(8,2) DEFAULT 0,
  mnt_meat_products DECIMAL(8,2) DEFAULT 0,
  mnt_gold_prods DECIMAL(8,2) DEFAULT 0,
  num_web_purchases INTEGER DEFAULT 0,
  num_store_purchases INTEGER DEFAULT 0,
  num_catalog_purchases INTEGER DEFAULT 0,
  num_web_visits_month INTEGER DEFAULT 0,
  accepted_cmp1 BOOLEAN DEFAULT FALSE,
  accepted_cmp2 BOOLEAN DEFAULT FALSE,
  accepted_cmp3 BOOLEAN DEFAULT FALSE,
  accepted_cmp4 BOOLEAN DEFAULT FALSE,
  accepted_cmp5 BOOLEAN DEFAULT FALSE,
  complain BOOLEAN DEFAULT FALSE,
  z_cost_contact DECIMAL(8,2) DEFAULT 3.0,
  z_revenue DECIMAL(10,2) DEFAULT 11.0,
  response BOOLEAN DEFAULT FALSE,
  age INTEGER,
  
  -- Augmented PII fields
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  location TEXT NOT NULL,
  
  -- Computed fields for analytics
  total_spent DECIMAL(10,2) GENERATED ALWAYS AS (
    COALESCE(mnt_wines, 0) + COALESCE(mnt_fruits, 0) + 
    COALESCE(mnt_meat_products, 0) + COALESCE(mnt_gold_prods, 0)
  ) STORED,
  total_purchases INTEGER GENERATED ALWAYS AS (
    COALESCE(num_web_purchases, 0) + COALESCE(num_store_purchases, 0) + 
    COALESCE(num_catalog_purchases, 0)
  ) STORED,
  campaigns_accepted INTEGER GENERATED ALWAYS AS (
    (CASE WHEN accepted_cmp1 THEN 1 ELSE 0 END) +
    (CASE WHEN accepted_cmp2 THEN 1 ELSE 0 END) +
    (CASE WHEN accepted_cmp3 THEN 1 ELSE 0 END) +
    (CASE WHEN accepted_cmp4 THEN 1 ELSE 0 END) +
    (CASE WHEN accepted_cmp5 THEN 1 ELSE 0 END)
  ) STORED,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own customers" 
ON public.customers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own customers" 
ON public.customers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customers" 
ON public.customers 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create analytics aggregation table for performance
CREATE TABLE public.analytics_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cache_key TEXT NOT NULL,
  data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics_cache ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own analytics cache" 
ON public.analytics_cache 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analytics cache" 
ON public.analytics_cache 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics cache" 
ON public.analytics_cache 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analytics cache" 
ON public.analytics_cache 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_customers_user_id ON public.customers (user_id);
CREATE INDEX idx_customers_age ON public.customers (age);
CREATE INDEX idx_customers_income ON public.customers (income);
CREATE INDEX idx_customers_total_spent ON public.customers (total_spent);
CREATE INDEX idx_customers_campaigns_accepted ON public.customers (campaigns_accepted);
CREATE INDEX idx_analytics_cache_user_key ON public.analytics_cache (user_id, cache_key);
CREATE INDEX idx_analytics_cache_expires ON public.analytics_cache (expires_at);

-- Add trigger for timestamps
CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_analytics_cache_updated_at
BEFORE UPDATE ON public.analytics_cache
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to compute analytics from real data
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
$$ LANGUAGE plpgsql SECURITY DEFINER;