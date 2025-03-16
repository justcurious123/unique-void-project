
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is authenticated
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast({
          title: "Not authenticated",
          description: "Please login to access the dashboard",
          variant: "destructive",
        });
        navigate("/auth");
      }
    };

    checkUser();
  }, [navigate, toast]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Signed out successfully",
      description: "You have been logged out",
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-pattern py-24 px-6">
      <div className="max-w-4xl mx-auto glass-card p-8 rounded-2xl">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <p className="text-lg mb-8">Welcome to your personal dashboard!</p>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Account</h2>
          <div className="bg-white/10 p-4 rounded-lg">
            <p className="mb-2">You are currently logged in.</p>
          </div>
        </div>
        
        <Button 
          variant="destructive" 
          onClick={handleSignOut}
          className="mt-4"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
