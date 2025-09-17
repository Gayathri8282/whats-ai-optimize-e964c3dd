-- Update ab_tests table to include product details and better integration
ALTER TABLE public.ab_tests ADD COLUMN IF NOT EXISTS product_details_id UUID REFERENCES public.product_details(id);
ALTER TABLE public.ab_tests ADD COLUMN IF NOT EXISTS target_audience TEXT;
ALTER TABLE public.ab_tests ADD COLUMN IF NOT EXISTS customer_count INTEGER DEFAULT 0;
ALTER TABLE public.ab_tests ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.ab_tests ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Update ab_test_variations table to include more detailed metrics
ALTER TABLE public.ab_test_variations ADD COLUMN IF NOT EXISTS read_count INTEGER DEFAULT 0;
ALTER TABLE public.ab_test_variations ADD COLUMN IF NOT EXISTS reply_count INTEGER DEFAULT 0;
ALTER TABLE public.ab_test_variations ADD COLUMN IF NOT EXISTS is_winner BOOLEAN DEFAULT false;
ALTER TABLE public.ab_test_variations ADD COLUMN IF NOT EXISTS traffic_allocation INTEGER DEFAULT 33;

-- Create function to automatically update A/B test status
CREATE OR REPLACE FUNCTION public.update_ab_test_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update test status based on variations performance
  IF NEW.sent_count > 0 AND OLD.sent_count = 0 THEN
    UPDATE public.ab_tests 
    SET status = 'running', started_at = now()
    WHERE id = NEW.ab_test_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;