
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSubscription } from "@/hooks/useSubscription";
import { CalendarIcon, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const ProfileTab = () => {
  const { user } = useAuth();
  const { currentPlan, usageData, isLoading } = useSubscription();

  const getPlanDetails = () => {
    if (!currentPlan || !usageData) return null;

    const planName = usageData.plan.charAt(0).toUpperCase() + usageData.plan.slice(1);
    
    const formattedStartDate = currentPlan.started_at 
      ? format(new Date(currentPlan.started_at), 'MMM d, yyyy')
      : 'N/A';
    
    const formattedExpireDate = currentPlan.expires_at 
      ? format(new Date(currentPlan.expires_at), 'MMM d, yyyy')
      : 'Never';

    return (
      <>
        <div className="text-sm mb-1"><span className="font-medium">Current Plan:</span> {planName}</div>
        <div className="text-sm mb-1"><span className="font-medium">Started:</span> {formattedStartDate}</div>
        {currentPlan.expires_at && (
          <div className="text-sm mb-1"><span className="font-medium">Expires:</span> {formattedExpireDate}</div>
        )}
        <div className="text-sm mb-1">
          <span className="font-medium">Status:</span> 
          <span className={`ml-1 ${currentPlan.active ? 'text-green-600' : 'text-red-600'}`}>
            {currentPlan.active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </>
    );
  };

  return (
    <div className="space-y-3 sm:space-y-6">
      <div className="bg-white/10 p-3 sm:p-6 rounded-lg">
        <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">Your Profile</h2>
        <p className="mb-2 sm:mb-4 text-sm sm:text-base">Manage your account settings and profile information.</p>
        
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4 bg-white/5">
            <h3 className="font-medium mb-2 text-sm sm:text-base">Account Information</h3>
            {user && (
              <div>
                <p className="text-xs sm:text-sm mb-1">
                  <span className="font-medium">Email:</span> {user.email}
                </p>
                <p className="text-xs sm:text-sm">
                  <span className="font-medium">Account ID:</span> {user.id.substring(0, 8)}...
                </p>
              </div>
            )}
          </Card>

          <Card className="p-4 bg-white/5">
            <h3 className="font-medium mb-2 flex items-center text-sm sm:text-base">
              <CreditCard className="h-4 w-4 mr-2" /> 
              Subscription
            </h3>
            
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : getPlanDetails()}
            
            <Link to="/pricing" className="mt-3 inline-block">
              <Button size="sm" variant="outline">Change Plan</Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
