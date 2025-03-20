
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { MessageSquare, User, Flag } from "lucide-react";
import FinancialChat from "@/components/FinancialChat";
import { useIsMobile } from "@/hooks/use-mobile";
import { GoalList } from "@/components/GoalList";
import { useGoals } from "@/hooks/useGoals";
import { useTasks } from "@/hooks/useTasks";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("goals");
  const isMobile = useIsMobile();
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const [goalTasksCache, setGoalTasksCache] = useState<Record<string, any[]>>({});

  const { goals, deleteGoal } = useGoals();
  const { tasks, isLoading: isTasksLoading, fetchTasks, updateTaskStatus } = useTasks(expandedGoalId || "");

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

  // Cache tasks for expanded goal
  useEffect(() => {
    if (expandedGoalId && tasks.length > 0) {
      setGoalTasksCache(prev => ({
        ...prev,
        [expandedGoalId]: tasks
      }));
    }
  }, [expandedGoalId, tasks]);

  const toggleGoalExpand = async (goalId: string) => {
    if (expandedGoalId === goalId) {
      setExpandedGoalId(null);
    } else {
      setExpandedGoalId(goalId);
    }
  };

  const calculateGoalProgress = (goalId: string) => {
    // First check if we have cached tasks for this goal
    const cachedTasks = goalTasksCache[goalId] || [];
    
    // If we have the goal expanded and tasks loaded, use current tasks
    const goalTasks = expandedGoalId === goalId ? tasks : cachedTasks;
    
    // If we don't have any tasks yet for this goal
    if (goalTasks.length === 0) {
      return 0;
    }
    
    const completedTasks = goalTasks.filter(task => task.completed).length;
    return Math.round((completedTasks / goalTasks.length) * 100);
  };

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
          
          <TabsContent value="goals" className="space-y-3 sm:space-y-6">
            <div className="bg-white/10 p-3 sm:p-6 rounded-lg">
              <GoalList
                goals={goals}
                expandedGoalId={expandedGoalId}
                onExpandGoal={toggleGoalExpand}
                onDeleteGoal={deleteGoal}
                calculateProgress={calculateGoalProgress}
                tasks={tasks}
                isTasksLoading={isTasksLoading}
                onUpdateTaskStatus={updateTaskStatus}
              />
              
              <div className="mt-3 sm:mt-6">
                <Link to="/goals">
                  <Button className="flex items-center gap-2 text-xs sm:text-sm h-8 sm:h-10">
                    <Flag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>Manage Financial Goals</span>
                  </Button>
                </Link>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="chat" className="space-y-3 sm:space-y-6">
            <div className="bg-white/10 p-1 sm:p-4 rounded-lg">
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
