
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Goal } from "@/hooks/types/goalTypes";
import GoalForm from "./GoalForm";
import { useGoalCreation } from "@/hooks/useGoalCreation";
import { useNavigate } from "react-router-dom";

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
  fetchTasks,
}) => {
  const navigate = useNavigate();
  const [openGoalDialog, setOpenGoalDialog] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    target_date: "",
  });

  const { isCreating, handleCreateGoal } = useGoalCreation({
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
      
      // Navigate to the goal detail page
      navigate(`/goal/${goalId}`);
      
      // Show a helpful toast message about the background processes
      toast.info("Creating your financial goal with AI-generated tasks and quizzes...");
    }
  };

  return (
    <Dialog open={openGoalDialog} onOpenChange={setOpenGoalDialog}>
      <DialogTrigger asChild>
        <Button className="gap-1">
          <Plus size={18} />
          New Goal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Financial Goal</DialogTitle>
          <DialogDescription>
            Define a financial goal you want to achieve. Tasks and quizzes will be automatically generated to help you reach your goal.
          </DialogDescription>
        </DialogHeader>
        
        <GoalForm newGoal={newGoal} setNewGoal={setNewGoal} />
        
        <DialogFooter>
          <Button type="submit" onClick={onSubmit} disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : 'Create Goal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGoalDialog;
