import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flag, Plus, ListChecks, Book, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useGoals } from "@/hooks/useGoals";
import { useTasks } from "@/hooks/useTasks";
import { useQuizzes } from "@/hooks/useQuizzes";
import { GoalList } from "@/components/GoalList";

const GoalsPage: React.FC = () => {
  const navigate = useNavigate();
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const [openGoalDialog, setOpenGoalDialog] = useState(false);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [openTaskSheet, setOpenTaskSheet] = useState(false);
  const [openQuizDialog, setOpenQuizDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newGoal, setNewGoal] = useState({ title: "", description: "", target_date: "" });
  const [newTask, setNewTask] = useState({ title: "", description: "", article_content: "" });
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Custom hooks
  const { goals, isLoading, createGoal, deleteGoal } = useGoals();
  const { tasks, fetchTasks, createTask, updateTaskStatus } = useTasks(expandedGoalId || "");
  const { fetchQuiz } = useQuizzes();

  // Check authentication status
  React.useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        toast.error("Please log in to view and manage your financial goals");
        navigate("/auth");
      }
    };
    
    checkAuth();
  }, [navigate]);

  // Handle goal expansion/collapse
  const toggleGoalExpand = (goalId: string) => {
    if (expandedGoalId === goalId) {
      setExpandedGoalId(null);
    } else {
      setExpandedGoalId(goalId);
      fetchTasks();
    }
  };

  // Calculate goal progress
  const calculateGoalProgress = (goalId: string) => {
    const goalTasks = tasks.filter(task => task.goal_id === goalId);
    if (goalTasks.length === 0) return 0;
    
    const completedTasks = goalTasks.filter(task => task.completed).length;
    return Math.round((completedTasks / goalTasks.length) * 100);
  };

  // Handle goal creation
  const handleCreateGoal = async () => {
    const success = await createGoal(newGoal);
    if (success) {
      setNewGoal({ title: "", description: "", target_date: "" });
      setOpenGoalDialog(false);
    }
  };

  // Handle task creation
  const handleCreateTask = async () => {
    const success = await createTask(newTask);
    if (success) {
      setNewTask({ title: "", description: "", article_content: "" });
      setOpenTaskDialog(false);
    }
  };

  // Handle quiz
  const startQuiz = async (taskId: string) => {
    const quiz = await fetchQuiz(taskId);
    if (quiz) {
      setQuizAnswers(Array(quiz.questions.length).fill(-1));
      setQuizScore(null);
      setOpenQuizDialog(true);
    } else {
      toast.error("No quiz available for this task");
    }
  };

  // Main render
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-20 px-4 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Flag className="h-8 w-8" />
          Financial Goals
        </h1>
        
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
                Define a financial goal you want to achieve. You can add tasks to break it down into actionable steps.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="title" className="text-sm font-medium">Goal Title</label>
                <Input
                  id="title"
                  placeholder="e.g., Save for retirement"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <Input
                  id="description"
                  placeholder="Briefly describe your goal"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="target_date" className="text-sm font-medium">Target Date</label>
                <Input
                  id="target_date"
                  type="date"
                  value={newGoal.target_date}
                  onChange={(e) => setNewGoal({...newGoal, target_date: e.target.value})}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="submit" onClick={handleCreateGoal}>Create Goal</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <GoalList
        goals={goals}
        expandedGoalId={expandedGoalId}
        onExpandGoal={toggleGoalExpand}
        onDeleteGoal={deleteGoal}
        calculateProgress={calculateGoalProgress}
      />
    </div>
  );
};

export default GoalsPage;
