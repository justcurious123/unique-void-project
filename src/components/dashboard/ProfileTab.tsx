
import React from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const ProfileTab = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Signed out successfully",
      description: "You have been logged out"
    });
    
    navigate("/");
  };

  return (
    <div className="space-y-3 sm:space-y-6">
      <div className="bg-white/10 p-3 sm:p-6 rounded-lg">
        <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">Your Profile</h2>
        <p className="mb-2 sm:mb-4 text-sm sm:text-base">Manage your account settings and profile information.</p>
        
        <div className="bg-white/5 p-3 sm:p-4 rounded-md mb-2 sm:mb-4">
          <h3 className="font-medium mb-1 sm:mb-2 text-sm sm:text-base">Account Information</h3>
          <p className="text-xs sm:text-sm">Your account details will be displayed here.</p>
        </div>
        
        <Button variant="destructive" onClick={handleSignOut} className="mt-2 sm:mt-4 text-xs sm:text-sm h-8 sm:h-10">
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default ProfileTab;
