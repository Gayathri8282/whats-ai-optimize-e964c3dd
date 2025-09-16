-- Create A/B testing tables
CREATE TABLE public.ab_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  traffic_split INTEGER NOT NULL DEFAULT 50,
  winner_variation TEXT,
  confidence_level NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.ab_test_variations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ab_test_id UUID NOT NULL,
  variation_name TEXT NOT NULL,
  message_template TEXT NOT NULL,
  audience_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  ctr NUMERIC DEFAULT 0,
  conversion_rate NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_test_variations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ab_tests
CREATE POLICY "Users can view ab_tests for their campaigns" 
ON public.ab_tests 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE campaigns.id = ab_tests.campaign_id 
    AND campaigns.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create ab_tests for their campaigns" 
ON public.ab_tests 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE campaigns.id = ab_tests.campaign_id 
    AND campaigns.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update ab_tests for their campaigns" 
ON public.ab_tests 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE campaigns.id = ab_tests.campaign_id 
    AND campaigns.user_id = auth.uid()
  )
);

-- Create RLS policies for ab_test_variations
CREATE POLICY "Users can view variations for their ab_tests" 
ON public.ab_test_variations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.ab_tests 
    JOIN public.campaigns ON campaigns.id = ab_tests.campaign_id
    WHERE ab_tests.id = ab_test_variations.ab_test_id 
    AND campaigns.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create variations for their ab_tests" 
ON public.ab_test_variations 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.ab_tests 
    JOIN public.campaigns ON campaigns.id = ab_tests.campaign_id
    WHERE ab_tests.id = ab_test_variations.ab_test_id 
    AND campaigns.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update variations for their ab_tests" 
ON public.ab_test_variations 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.ab_tests 
    JOIN public.campaigns ON campaigns.id = ab_tests.campaign_id
    WHERE ab_tests.id = ab_test_variations.ab_test_id 
    AND campaigns.user_id = auth.uid()
  )
);

-- Create triggers for updated_at
CREATE TRIGGER update_ab_tests_updated_at
  BEFORE UPDATE ON public.ab_tests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ab_test_variations_updated_at
  BEFORE UPDATE ON public.ab_test_variations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();