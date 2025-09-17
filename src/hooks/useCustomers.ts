import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Customer {
  id: string;
  user_id: string;
  income: number;
  age: number;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  total_spent: number;
  total_purchases: number;
  campaigns_accepted: number;
  complain: boolean;
  opt_out?: boolean;
  mnt_wines: number;
  mnt_fruits: number;
  mnt_meat_products: number;
  mnt_gold_prods: number;
  recency: number;
  created_at: string;
}

export interface CustomerSegment {
  segment: string;
  count: number;
  avg_spending: number;
  engagement_rate: number;
  growth_rate: number;
}

export function useCustomers(limit: number = 50) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("User not authenticated");
        return;
      }

      // Fetch customers
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .order('total_spent', { ascending: false })
        .limit(limit);

      if (customerError) throw customerError;

      setCustomers(customerData || []);

      // Calculate customer segments
      if (customerData && customerData.length > 0) {
        const segments = calculateSegments(customerData);
        setSegments(segments);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load customers');
      toast({
        title: "Error",
        description: "Failed to load customer data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSegments = (customerData: Customer[]): CustomerSegment[] => {
    const totalCustomers = customerData.length;
    
    // Segment by spending tiers
    const highValue = customerData.filter(c => c.total_spent > 1000);
    const mediumValue = customerData.filter(c => c.total_spent > 500 && c.total_spent <= 1000);
    const lowValue = customerData.filter(c => c.total_spent <= 500);
    
    // Segment by engagement (campaigns accepted)
    const engaged = customerData.filter(c => c.campaigns_accepted >= 3);
    const moderateEngaged = customerData.filter(c => c.campaigns_accepted >= 1 && c.campaigns_accepted < 3);
    const disengaged = customerData.filter(c => c.campaigns_accepted === 0);

    return [
      {
        segment: "High Value Customers",
        count: highValue.length,
        avg_spending: highValue.reduce((sum, c) => sum + c.total_spent, 0) / Math.max(highValue.length, 1),
        engagement_rate: (highValue.filter(c => c.campaigns_accepted > 0).length / Math.max(highValue.length, 1)) * 100,
        growth_rate: Math.random() * 20 - 5 // Simulate growth rate
      },
      {
        segment: "Medium Value Customers",
        count: mediumValue.length,
        avg_spending: mediumValue.reduce((sum, c) => sum + c.total_spent, 0) / Math.max(mediumValue.length, 1),
        engagement_rate: (mediumValue.filter(c => c.campaigns_accepted > 0).length / Math.max(mediumValue.length, 1)) * 100,
        growth_rate: Math.random() * 15 - 3
      },
      {
        segment: "New/Low Value Customers",
        count: lowValue.length,
        avg_spending: lowValue.reduce((sum, c) => sum + c.total_spent, 0) / Math.max(lowValue.length, 1),
        engagement_rate: (lowValue.filter(c => c.campaigns_accepted > 0).length / Math.max(lowValue.length, 1)) * 100,
        growth_rate: Math.random() * 25 - 10
      }
    ];
  };

  const findSimilarCustomers = async (customerId: string, limit: number = 5) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .neq('id', customerId)
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error finding similar customers:', err);
      return [];
    }
  };

  const addCustomer = async (customerData: Partial<Customer>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const newCustomer = {
        ...customerData,
        user_id: user.id,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('customers')
        .insert(newCustomer as any)
        .select()
        .single();

      if (error) throw error;

      // Refresh the customers list
      await fetchCustomers();
      
      return data;
    } catch (err) {
      console.error('Error adding customer:', err);
      throw err;
    }
  };

  const updateCustomer = async (customerId: string, customerData: Partial<Customer>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from('customers')
        .update({
          ...customerData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', customerId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Refresh the customers list
      await fetchCustomers();
      
      return data;
    } catch (err) {
      console.error('Error updating customer:', err);
      throw err;
    }
  };

  const deleteCustomer = async (customerId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Refresh the customers list
      await fetchCustomers();
      
      return true;
    } catch (err) {
      console.error('Error deleting customer:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [limit]);

  return {
    customers,
    segments,
    isLoading,
    error,
    refetch: fetchCustomers,
    findSimilarCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer
  };
}