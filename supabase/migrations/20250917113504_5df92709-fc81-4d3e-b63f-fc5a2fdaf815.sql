-- Add international support columns to customers table
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS city TEXT;

-- Create index for better performance on country and city filtering
CREATE INDEX IF NOT EXISTS idx_customers_country ON public.customers(country);
CREATE INDEX IF NOT EXISTS idx_customers_city ON public.customers(city);

-- Update existing customers to parse location into country and city where possible
-- This will help with backward compatibility
UPDATE public.customers 
SET 
  country = 'US',
  city = CASE 
    WHEN location LIKE '%,%' THEN SPLIT_PART(location, ',', 1)
    ELSE location
  END
WHERE country IS NULL AND location IS NOT NULL;