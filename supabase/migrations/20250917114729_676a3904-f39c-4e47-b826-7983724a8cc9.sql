-- Check if total_spent has any constraints and remove them
DO $$ 
BEGIN
    -- Remove any generated column constraint on total_spent
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' 
        AND column_name = 'total_spent' 
        AND is_generated = 'ALWAYS'
    ) THEN
        ALTER TABLE public.customers ALTER COLUMN total_spent DROP EXPRESSION;
    END IF;
    
    -- Ensure the column allows manual insertion
    ALTER TABLE public.customers ALTER COLUMN total_spent SET DEFAULT NULL;
END $$;

-- Also check other potentially problematic columns
DO $$ 
BEGIN
    -- Remove any generated column constraint on total_purchases if exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' 
        AND column_name = 'total_purchases' 
        AND is_generated = 'ALWAYS'
    ) THEN
        ALTER TABLE public.customers ALTER COLUMN total_purchases DROP EXPRESSION;
    END IF;
    
    -- Remove any generated column constraint on campaigns_accepted if exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' 
        AND column_name = 'campaigns_accepted' 
        AND is_generated = 'ALWAYS'
    ) THEN
        ALTER TABLE public.customers ALTER COLUMN campaigns_accepted DROP EXPRESSION;
    END IF;
END $$;