-- Add bandit sampling columns to ab_test_results table for Thompson Sampling tracking

ALTER TABLE public.ab_test_results 
ADD COLUMN IF NOT EXISTS bandit_sample numeric,
ADD COLUMN IF NOT EXISTS bandit_samples jsonb;

COMMENT ON COLUMN public.ab_test_results.bandit_sample IS 'The sampled value used for this customer assignment in Thompson Sampling';
COMMENT ON COLUMN public.ab_test_results.bandit_samples IS 'Array of all sampled values for all variations for analysis';