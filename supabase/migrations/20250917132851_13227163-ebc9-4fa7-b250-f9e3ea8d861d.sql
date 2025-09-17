-- Create ab_test_results table for storing A/B test campaign metrics
CREATE TABLE public.ab_test_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ab_test_id UUID NOT NULL,
  variation_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  message_sent BOOLEAN DEFAULT false,
  message_sent_at TIMESTAMP WITH TIME ZONE,
  opened BOOLEAN DEFAULT false,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked BOOLEAN DEFAULT false,
  clicked_at TIMESTAMP WITH TIME ZONE,
  converted BOOLEAN DEFAULT false,
  converted_at TIMESTAMP WITH TIME ZONE,
  replied BOOLEAN DEFAULT false,
  replied_at TIMESTAMP WITH TIME ZONE,
  revenue DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ab_test_results ENABLE ROW LEVEL SECURITY;

-- Create policies for ab_test_results
CREATE POLICY "Users can view results for their ab_tests" 
ON public.ab_test_results 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM ab_tests
  JOIN campaigns ON campaigns.id = ab_tests.campaign_id
  WHERE ab_tests.id = ab_test_results.ab_test_id AND campaigns.user_id = auth.uid()
));

CREATE POLICY "Users can create results for their ab_tests" 
ON public.ab_test_results 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM ab_tests
  JOIN campaigns ON campaigns.id = ab_tests.campaign_id
  WHERE ab_tests.id = ab_test_results.ab_test_id AND campaigns.user_id = auth.uid()
));

CREATE POLICY "Users can update results for their ab_tests" 
ON public.ab_test_results 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM ab_tests
  JOIN campaigns ON campaigns.id = ab_tests.campaign_id
  WHERE ab_tests.id = ab_test_results.ab_test_id AND campaigns.user_id = auth.uid()
));

-- Add indexes for better performance
CREATE INDEX idx_ab_test_results_ab_test_id ON public.ab_test_results(ab_test_id);
CREATE INDEX idx_ab_test_results_variation_id ON public.ab_test_results(variation_id);
CREATE INDEX idx_ab_test_results_customer_id ON public.ab_test_results(customer_id);

-- Create trigger for updated_at
CREATE TRIGGER update_ab_test_results_updated_at
BEFORE UPDATE ON public.ab_test_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add some additional columns to campaigns table for better functionality
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS total_revenue DECIMAL DEFAULT 0;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS total_cost DECIMAL DEFAULT 0;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS roi DECIMAL DEFAULT 0;