-- Create product_details table to store product information for A/B testing
CREATE TABLE IF NOT EXISTS public.product_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  campaign_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  price TEXT,
  features TEXT,
  benefits TEXT,
  offer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_details ENABLE ROW LEVEL SECURITY;

-- Create policies for product_details
CREATE POLICY "Users can create their own product details" 
ON public.product_details 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own product details" 
ON public.product_details 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own product details" 
ON public.product_details 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own product details" 
ON public.product_details 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_product_details_updated_at
BEFORE UPDATE ON public.product_details
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();