
import { useMemo } from 'react';
import { UsageData } from '@/hooks/useSubscription';

export const useLimits = (usageData: UsageData | null) => {
  const goalLimitReached = useMemo(() => {
    if (!usageData) return false;
    return usageData.total_goals >= usageData.goals_limit;
  }, [usageData]);

  const messageLimitReached = useMemo(() => {
    if (!usageData) return false;
    return usageData.daily_messages_sent >= usageData.messages_limit;
  }, [usageData]);

  const goalLimitPercentage = useMemo(() => {
    if (!usageData || usageData.goals_limit === 0) return 0;
    return Math.min(100, Math.round((usageData.total_goals / usageData.goals_limit) * 100));
  }, [usageData]);

  const messageLimitPercentage = useMemo(() => {
    if (!usageData || usageData.messages_limit === 0) return 0;
    return Math.min(100, Math.round((usageData.daily_messages_sent / usageData.messages_limit) * 100));
  }, [usageData]);

  return {
    goalLimitReached,
    messageLimitReached,
    goalLimitPercentage,
    messageLimitPercentage
  };
};
