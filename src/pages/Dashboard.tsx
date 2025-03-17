
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Home, MessageSquare, User } from "lucide-react";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("home");

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
    <div className="min-h-screen bg-pattern py-8 px-6">
      <div className="max-w-4xl mx-auto glass-card p-6 rounded-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-lg text-muted-foreground">Welcome to your personal dashboard!</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="home" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Chat</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="home" className="space-y-6">
            <div className="bg-white/10 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Welcome Home</h2>
              <p className="mb-4">This is your dashboard home. You can access all your important information from here.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Quick Stats</h3>
                  <p>Your account information and statistics will appear here.</p>
                </div>
                <div className="bg-white/5 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Recent Activity</h3>
                  <p>Your recent activities will be displayed here.</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="chat" className="space-y-6">
            <div className="bg-white/10 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Chat</h2>
              <p>The chat functionality is coming soon.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="profile" className="space-y-6">
            <div className="bg-white/10 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
              <p className="mb-4">Manage your account settings and profile information.</p>
              
              <div className="bg-white/5 p-4 rounded-md mb-4">
                <h3 className="font-medium mb-2">Account Information</h3>
                <p>Your account details will be displayed here.</p>
              </div>
              
              <Button 
                variant="destructive" 
                onClick={handleSignOut}
                className="mt-4"
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
