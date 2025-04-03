
import React from "react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { useSubscription } from "@/hooks/useSubscription";
import { useLimits } from "@/hooks/useLimits";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface UsageLimitsProps {
  alwaysShow?: boolean;
}

const UsageLimits: React.FC<UsageLimitsProps> = ({ alwaysShow = false }) => {
  const { usageData, isLoading } = useSubscription();
  const { goalLimitPercentage, messageLimitPercentage, goalLimitReached, messageLimitReached } = useLimits(usageData);
  
  // Don't show the component unless always show is true or one of the limits is reached
  if (!alwaysShow && !goalLimitReached && !messageLimitReached) {
    return null;
  }
  
  if (isLoading) {
    return (
      <div className="space-y-4 p-4 border rounded-lg">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-10 w-1/3" />
      </div>
    );
  }
  
  if (!usageData) {
    return null;
  }
  
  const planName = usageData.plan.charAt(0).toUpperCase() + usageData.plan.slice(1);

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">Your Usage Limits</h3>
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
          {planName} Plan
        </span>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Goals</span>
            <span className={goalLimitReached ? "text-red-500 font-medium" : ""}>
              {usageData.total_goals}/{usageData.goals_limit === 1000 ? "∞" : usageData.goals_limit}
            </span>
          </div>
          <Progress value={goalLimitPercentage} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Daily Messages</span>
            <span className={messageLimitReached ? "text-red-500 font-medium" : ""}>
              {usageData.daily_messages_sent}/{usageData.messages_limit === 1000 ? "∞" : usageData.messages_limit}
            </span>
          </div>
          <Progress value={messageLimitPercentage} className="h-2" />
        </div>
      </div>

      {(goalLimitReached || messageLimitReached) && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm text-amber-800">
              You've reached your {goalLimitReached ? 'goal creation' : 'daily message'} limit on your current plan.
            </p>
            <Link to="/pricing">
              <Button size="sm" variant="outline" className="text-xs h-8">
                Upgrade Plan
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsageLimits;
