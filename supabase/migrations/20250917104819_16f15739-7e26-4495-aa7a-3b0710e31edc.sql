-- Create campaign_logs table to track delivery results
CREATE TABLE public.campaign_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  campaign_name TEXT NOT NULL,
  customer_id UUID,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email')),
  recipient_phone TEXT,
  recipient_email TEXT,
  message_content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'opt_out')),
  error_message TEXT,
  delivery_id TEXT, -- Twilio/SendGrid message ID
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.campaign_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own campaign logs" 
ON public.campaign_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own campaign logs" 
ON public.campaign_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaign logs" 
ON public.campaign_logs 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add trigger for timestamps
CREATE TRIGGER update_campaign_logs_updated_at
BEFORE UPDATE ON public.campaign_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add opt_out column to customers table
ALTER TABLE public.customers 
ADD COLUMN opt_out BOOLEAN DEFAULT false;

-- Create index for better performance
CREATE INDEX idx_campaign_logs_user_id_status ON public.campaign_logs(user_id, status);
CREATE INDEX idx_campaign_logs_delivery_id ON public.campaign_logs(delivery_id);
CREATE INDEX idx_customers_opt_out ON public.customers(user_id, opt_out);