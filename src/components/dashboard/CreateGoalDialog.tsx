
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Goal } from "@/hooks/types/goalTypes";
import GoalForm from "./GoalForm";
import { useGoalCreation } from "@/hooks/useGoalCreation";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { useLimits } from "@/hooks/useLimits";
import { AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface CreateGoalDialogProps {
  onCreateGoal: (newGoal: {
    title: string;
    description: string;
    target_date: string;
  }) => Promise<Goal | null>;
  onGoalCreated: (goalId: string) => void;
  refreshGoals: () => void;
  createTask: (task: any) => Promise<any>;
  fetchTasks: () => void;
}

const CreateGoalDialog: React.FC<CreateGoalDialogProps> = ({
  onCreateGoal,
  onGoalCreated,
  refreshGoals,
  createTask,
  fetchTasks
}) => {
  const navigate = useNavigate();
  const [openGoalDialog, setOpenGoalDialog] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    target_date: ""
  });
  
  const { usageData, isLoading: isLoadingSubscription } = useSubscription();
  const { goalLimitReached } = useLimits(usageData);
  
  const {
    isCreating,
    handleCreateGoal
  } = useGoalCreation({
    refreshGoals,
    createTask,
    fetchTasks,
    onGoalCreated
  });
  
  const onSubmit = async () => {
    // Validate form inputs
    if (!newGoal.title.trim()) {
      toast.error("Please enter a goal title");
      return;
    }

    // Check if goal limit is reached
    if (goalLimitReached) {
      toast.error("You've reached your goal creation limit. Please upgrade your plan to create more goals.");
      setOpenGoalDialog(false);
      return;
    }

    // Close dialog immediately to improve perceived performance
    setOpenGoalDialog(false);

    // Create the goal and get its ID
    const goalId = await handleCreateGoal(newGoal, onCreateGoal);
    if (goalId) {
      // Reset form for next time
      setNewGoal({
        title: "",
        description: "",
        target_date: ""
      });

      // Show a helpful toast message about the background processes
      toast.info("Creating your financial goal with AI-generated tasks and quizzes...");

      // Use navigate with { replace: false } to ensure we don't replace the current entry in history
      // This prevents unexpected back navigation
      navigate(`/goal/${goalId}`, {
        replace: false
      });
    }
  };
  
  return <Dialog open={openGoalDialog} onOpenChange={setOpenGoalDialog}>
      <DialogTrigger asChild>
        <Button className="gap-1" disabled={goalLimitReached}>
          <Plus size={18} />
          New Goal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Goal</DialogTitle>
          <DialogDescription>Define a goal you want to achieve.</DialogDescription>
        </DialogHeader>
        
        {goalLimitReached && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm text-amber-800">
                You've reached your goal creation limit on your current plan.
              </p>
              <Link to="/pricing">
                <Button size="sm" variant="outline" className="text-xs h-8">
                  Upgrade Plan
                </Button>
              </Link>
            </div>
          </div>
        )}
        
        <GoalForm newGoal={newGoal} setNewGoal={setNewGoal} />
        
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={onSubmit} 
            disabled={isCreating || goalLimitReached}
          >
            {isCreating ? <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </> : 'Create Goal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
};

export default CreateGoalDialog;
