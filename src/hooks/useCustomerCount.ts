import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to get the total customer count for the current user
 * This is the single source of truth for customer counts across the app
 */
export function useCustomerCount() {
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCount = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCount(0);
        setIsLoading(false);
        return;
      }

      const { count: customerCount, error: countError } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (countError) throw countError;

      setCount(customerCount || 0);
    } catch (err) {
      console.error('Error fetching customer count:', err);
      setError(err instanceof Error ? err.message : 'Failed to load customer count');
      setCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCount();

    // Set up real-time subscription for customer changes
    const channel = supabase
      .channel('customer-count-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers'
        },
        () => {
          // Refetch count when any customer is added/updated/deleted
          fetchCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { count, isLoading, error, refetch: fetchCount };
}
