
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { MessageSquare, User, Flag } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import GoalsTab from "@/components/dashboard/GoalsTab";
import ChatTab from "@/components/dashboard/ChatTab";
import ProfileTab from "@/components/dashboard/ProfileTab";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState("goals");
  const isMobile = useIsMobile();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Not authenticated",
        description: "Please login to access the dashboard",
        variant: "destructive"
      });
      navigate("/auth");
    }
  }, [user, isLoading, navigate, toast]);

  // Show loading state while checking auth
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-center">
        <p className="text-lg text-foreground/60">Loading...</p>
      </div>
    </div>;
  }

  // If not authenticated, return null (will be redirected)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-pattern py-1 sm:py-8 px-1 sm:px-6">
      <div className="max-w-4xl mx-auto glass-card p-2 sm:p-6 rounded-2xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-3 sm:mb-6">
            <TabsTrigger value="goals" className="flex items-center gap-1 sm:gap-2 px-1 sm:px-4">
              <Flag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className={isMobile ? "text-xs" : ""}>Goals</span>
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
          
          <TabsContent value="goals">
            <GoalsTab />
          </TabsContent>
          
          <TabsContent value="chat">
            <ChatTab />
          </TabsContent>
          
          <TabsContent value="profile">
            <ProfileTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
