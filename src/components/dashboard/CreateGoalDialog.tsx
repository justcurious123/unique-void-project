
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
import { Goal } from "@/hooks/useGoals";
import GoalForm from "./GoalForm";
import { useGoalCreation } from "@/hooks/useGoalCreation";

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
    const success = await handleCreateGoal(newGoal, onCreateGoal);
    if (success) {
      setNewGoal({
        title: "",
        description: "",
        target_date: ""
      });
      setOpenGoalDialog(false);
      toast.success("Financial goal created with AI-generated tasks and quizzes!");
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
