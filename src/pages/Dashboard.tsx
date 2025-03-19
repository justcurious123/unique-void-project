
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Home, MessageSquare, User, Flag } from "lucide-react";
import FinancialChat from "@/components/FinancialChat";
import { useIsMobile } from "@/hooks/use-mobile";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("home");
  const isMobile = useIsMobile();

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
    <div className="min-h-screen bg-pattern py-2 sm:py-8 px-2 sm:px-6">
      <div className="max-w-4xl mx-auto glass-card p-3 sm:p-6 rounded-2xl">
        <div className="mb-3 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-base sm:text-lg text-muted-foreground">Welcome to your personal dashboard!</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6">
            <TabsTrigger value="home" className="flex items-center gap-1 sm:gap-2 px-1 sm:px-4">
              <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className={isMobile ? "text-xs" : ""}>Home</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-1 sm:gap-2 px-1 sm:px-4">
              <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className={isMobile ? "text-xs" : ""}>Chat</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-1 sm:gap-2 px-1 sm:px-4">
              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className={isMobile ? "text-xs" : ""}>Profile</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="home" className="space-y-3 sm:space-y-6">
            <div className="bg-white/10 p-3 sm:p-6 rounded-lg">
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">Welcome Home</h2>
              <p className="mb-2 sm:mb-4 text-sm sm:text-base">This is your dashboard home. You can access all your important information from here.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
                <div className="bg-white/5 p-3 sm:p-4 rounded-md">
                  <h3 className="font-medium mb-1 sm:mb-2 text-sm sm:text-base">Quick Stats</h3>
                  <p className="text-xs sm:text-sm">Your account information and statistics will appear here.</p>
                </div>
                <div className="bg-white/5 p-3 sm:p-4 rounded-md">
                  <h3 className="font-medium mb-1 sm:mb-2 text-sm sm:text-base">Recent Activity</h3>
                  <p className="text-xs sm:text-sm">Your recent activities will be displayed here.</p>
                </div>
              </div>
              
              <div className="mt-3 sm:mt-6">
                <Link to="/goals">
                  <Button className="flex items-center gap-2 text-xs sm:text-sm h-8 sm:h-10">
                    <Flag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>View Your Financial Goals</span>
                  </Button>
                </Link>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="chat" className="space-y-3 sm:space-y-6">
            <div className="bg-white/10 p-2 sm:p-6 rounded-lg">
              <FinancialChat />
            </div>
          </TabsContent>
          
          <TabsContent value="profile" className="space-y-3 sm:space-y-6">
            <div className="bg-white/10 p-3 sm:p-6 rounded-lg">
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">Your Profile</h2>
              <p className="mb-2 sm:mb-4 text-sm sm:text-base">Manage your account settings and profile information.</p>
              
              <div className="bg-white/5 p-3 sm:p-4 rounded-md mb-2 sm:mb-4">
                <h3 className="font-medium mb-1 sm:mb-2 text-sm sm:text-base">Account Information</h3>
                <p className="text-xs sm:text-sm">Your account details will be displayed here.</p>
              </div>
              
              <Button 
                variant="destructive" 
                onClick={handleSignOut}
                className="mt-2 sm:mt-4 text-xs sm:text-sm h-8 sm:h-10"
              >
                Sign Out
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
