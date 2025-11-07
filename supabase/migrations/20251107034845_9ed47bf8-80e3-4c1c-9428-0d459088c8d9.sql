-- Enable real-time updates for customers table
-- This allows the frontend to receive instant updates when customers are added/removed

-- Set REPLICA IDENTITY to FULL to capture complete row data during updates
ALTER TABLE public.customers REPLICA IDENTITY FULL;

-- Add the customers table to the supabase_realtime publication
-- This activates real-time functionality for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;