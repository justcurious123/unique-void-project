
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SubscriptionPlan {
  plan: 'free' | 'monthly' | 'annual';
  started_at: string;
  expires_at: string | null;
  active: boolean;
}

export interface UsageData {
  plan: string;
  daily_goals_created: number;
  daily_messages_sent: number;
  total_goals: number;
  goals_limit: number;
  messages_limit: number;
}

export const useSubscription = () => {
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get user's subscription plan
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .single();

      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        console.error("Error fetching subscription:", subscriptionError);
        setError("Failed to fetch subscription data");
        return;
      }

      // Get usage limits and stats
      const { data: usageLimitsData, error: usageLimitsError } = await supabase
        .rpc('get_user_usage_and_limits');

      if (usageLimitsError) {
        console.error("Error fetching usage data:", usageLimitsError);
        setError("Failed to fetch usage data");
        return;
      }

      setCurrentPlan(subscriptionData);
      setUsageData(usageLimitsData);
    } catch (err: any) {
      console.error("Unexpected error in useSubscription:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe to plan changes
  const updateSubscription = async (plan: 'free' | 'monthly' | 'annual') => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({ 
          plan,
          // For monthly plan, set expiration to 30 days from now
          expires_at: plan === 'monthly' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : 
                     // For annual plan, set expiration to 365 days from now
                     plan === 'annual' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() :
                     // For free plan, no expiration
                     null,
          active: true
        })
        .eq('user_id', (await supabase.auth.getSession()).data.session?.user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success(`Successfully updated to ${plan} plan`);
      await fetchSubscriptionData();
      return true;
    } catch (err: any) {
      console.error("Error updating subscription:", err);
      toast.error(`Failed to update subscription: ${err.message}`);
      return false;
    }
  };

  // Fetch data on mount
  useEffect(() => {
    const session = supabase.auth.getSession();
    if (session) {
      fetchSubscriptionData();
    }
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        fetchSubscriptionData();
      } else if (event === 'SIGNED_OUT') {
        setCurrentPlan(null);
        setUsageData(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return {
    currentPlan,
    usageData,
    isLoading,
    error,
    fetchSubscriptionData,
    updateSubscription
  };
};
