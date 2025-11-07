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
  country?: string;
  city?: string;
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
  // Additional database fields
  kidhome?: number;
  teenhome?: number;
  num_web_purchases?: number;
  num_store_purchases?: number;
  num_catalog_purchases?: number;
  num_web_visits_month?: number;
  response?: boolean;
  z_cost_contact?: number;
  z_revenue?: number;
  accepted_cmp1?: boolean;
  accepted_cmp2?: boolean;
  accepted_cmp3?: boolean;
  accepted_cmp4?: boolean;
  accepted_cmp5?: boolean;
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

      // Fetch customers ordered by created_at desc to show newest first
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
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
    
    // Filter out customers with null/undefined values for calculations
    const validCustomers = customerData.filter(c => 
      c.total_spent != null && 
      c.campaigns_accepted != null
    );
    
    // Segment by spending tiers
    const highValue = validCustomers.filter(c => c.total_spent > 1000);
    const mediumValue = validCustomers.filter(c => c.total_spent > 500 && c.total_spent <= 1000);
    const lowValue = validCustomers.filter(c => c.total_spent <= 500);
    
    const calculateAvgSpending = (segment: Customer[]) => {
      if (segment.length === 0) return 0;
      const total = segment.reduce((sum, c) => sum + (c.total_spent || 0), 0);
      return total / segment.length;
    };
    
    const calculateEngagementRate = (segment: Customer[]) => {
      if (segment.length === 0) return 0;
      const engaged = segment.filter(c => (c.campaigns_accepted || 0) > 0).length;
      return (engaged / segment.length) * 100;
    };

    return [
      {
        segment: "High Value Customers",
        count: highValue.length,
        avg_spending: calculateAvgSpending(highValue),
        engagement_rate: calculateEngagementRate(highValue),
        growth_rate: Math.random() * 20 - 5
      },
      {
        segment: "Medium Value Customers",
        count: mediumValue.length,
        avg_spending: calculateAvgSpending(mediumValue),
        engagement_rate: calculateEngagementRate(mediumValue),
        growth_rate: Math.random() * 15 - 3
      },
      {
        segment: "New/Low Value Customers",
        count: lowValue.length,
        avg_spending: calculateAvgSpending(lowValue),
        engagement_rate: calculateEngagementRate(lowValue),
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
      console.log('=== ADD CUSTOMER DEBUG ===');
      console.log('Customer Data:', customerData);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }
      console.log('User ID:', user.id);

      // Prepare the customer data for insert
      const newCustomer = {
        full_name: customerData.full_name,
        email: customerData.email,
        phone: customerData.phone, // Use the formatted phone directly
        location: customerData.location,
        country: customerData.country,
        city: customerData.city,
        age: customerData.age,
        income: customerData.income,
        total_spent: customerData.total_spent,
        total_purchases: customerData.total_purchases,
        campaigns_accepted: customerData.campaigns_accepted,
        opt_out: customerData.opt_out ?? false,
        complain: customerData.complain ?? false,
        recency: customerData.recency ?? 30,
        mnt_wines: customerData.mnt_wines ?? 0,
        mnt_fruits: customerData.mnt_fruits ?? 0,
        mnt_meat_products: customerData.mnt_meat_products ?? 0,
        mnt_gold_prods: customerData.mnt_gold_prods ?? 0,
        user_id: user.id,
        // Default values for database fields
        kidhome: 0,
        teenhome: 0,
        num_web_purchases: 0,
        num_store_purchases: 0,
        num_catalog_purchases: 0,
        num_web_visits_month: 0,
        response: false,
        z_cost_contact: 3.0,
        z_revenue: 11.0,
        accepted_cmp1: false,
        accepted_cmp2: false,
        accepted_cmp3: false,
        accepted_cmp4: false,
        accepted_cmp5: false,
      };

      console.log('Prepared customer data:', newCustomer);

      // Use the exact format requested
      const { data, error } = await supabase
        .from("customers")
        .insert([newCustomer])
        .select()
        .single();

      console.log('Insert result - data:', data);
      console.log('Insert result - error:', error);

      // Only show success toast if error === null
      if (error === null) {
        toast({
          title: "Customer Added",
          description: `${customerData.full_name} has been added successfully`,
        });
        
        // Re-fetch the customer list to show new customer immediately
        await fetchCustomers();
        return data;
      } else {
        // Show error toast with actual Supabase error message
        toast({
          title: "Error Adding Customer",
          description: error.message || "Failed to add customer",
          variant: "destructive"
        });
        throw error;
      }
    } catch (err) {
      console.error('Error adding customer:', err);
      // Show error toast with actual error message
      toast({
        title: "Error Adding Customer", 
        description: err instanceof Error ? err.message : "Failed to add customer",
        variant: "destructive"
      });
      throw err;
    }
  };

  const updateCustomer = async (customerId: string, customerData: Partial<Customer>) => {
    try {
      console.log('=== UPDATE CUSTOMER DEBUG ===');
      console.log('Customer ID:', customerId);
      console.log('Customer Data:', customerData);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }
      console.log('User ID:', user.id);

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

      console.log('Update result - data:', data);
      console.log('Update result - error:', error);

      if (error === null) {
        toast({
          title: "Customer Updated",
          description: `${customerData.full_name || 'Customer'} has been updated successfully`,
        });
        
        // Refresh the customers list
        await fetchCustomers();
        return data;
      } else {
        toast({
          title: "Error Updating Customer",
          description: error.message || "Failed to update customer",
          variant: "destructive"
        });
        throw error;
      }
    } catch (err) {
      console.error('Error updating customer:', err);
      toast({
        title: "Error Updating Customer",
        description: err instanceof Error ? err.message : "Failed to update customer",
        variant: "destructive"
      });
      throw err;
    }
  };

  const deleteCustomer = async (customerId: string) => {
    try {
      console.log('=== DELETE CUSTOMER DEBUG ===');
      console.log('Customer ID:', customerId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }
      console.log('User ID:', user.id);

      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId)
        .eq('user_id', user.id);

      console.log('Delete result - error:', error);

      if (error === null) {
        toast({
          title: "Customer Deleted",
          description: "Customer has been deleted successfully",
        });
        
        // Refresh the customers list
        await fetchCustomers();
        return true;
      } else {
        toast({
          title: "Error Deleting Customer",
          description: error.message || "Failed to delete customer",
          variant: "destructive"
        });
        throw error;
      }
    } catch (err) {
      console.error('Error deleting customer:', err);
      toast({
        title: "Error Deleting Customer",
        description: err instanceof Error ? err.message : "Failed to delete customer",
        variant: "destructive"
      });
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