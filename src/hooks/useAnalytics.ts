import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AnalyticsData {
  total_customers: number;
  total_revenue: number;
  total_cost: number;
  roi: number;
  avg_ctr: number;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  computed_at: number;
}

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("User not authenticated");
        return;
      }

      // Check cache first
      const cacheKey = `analytics_${user.id}`;
      const { data: cached } = await supabase
        .from('analytics_cache')
        .select('data, expires_at')
        .eq('user_id', user.id)
        .eq('cache_key', cacheKey)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (cached) {
        setAnalytics(cached.data as any);
        setIsLoading(false);
        return;
      }

      // Compute fresh analytics
      const { data, error } = await supabase.rpc('compute_campaign_analytics', {
        user_uuid: user.id
      });

      if (error) throw error;

      // Cache the result for 5 minutes
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      await supabase
        .from('analytics_cache')
        .upsert({
          user_id: user.id,
          cache_key: cacheKey,
          data: data as any,
          expires_at: expiresAt.toISOString()
        });

      setAnalytics(data as any);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    analytics,
    isLoading,
    error,
    refetch: fetchAnalytics
  };
}