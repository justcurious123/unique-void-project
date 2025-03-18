
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Flag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useGoals } from "@/hooks/useGoals";
import { useTasks } from "@/hooks/useTasks";
import { GoalList } from "@/components/GoalList";

const GoalsPage: React.FC = () => {
  const navigate = useNavigate();
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const [openGoalDialog, setOpenGoalDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: "", description: "", target_date: "" });
  
  // Custom hooks
  const { goals, createGoal, deleteGoal } = useGoals();
  const { tasks, isLoading: isTasksLoading, fetchTasks, createTask, updateTaskStatus } = useTasks(expandedGoalId || "");

  // Check authentication status
  useEffect(() => {
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
  const toggleGoalExpand = async (goalId: string) => {
    if (expandedGoalId === goalId) {
      setExpandedGoalId(null);
    } else {
      setExpandedGoalId(goalId);
    }
  };

  // Calculate goal progress
  const calculateGoalProgress = (goalId: string) => {
    if (!expandedGoalId || expandedGoalId !== goalId) return 0;
    
    const goalTasks = tasks.filter(task => task.goal_id === goalId);
    if (goalTasks.length === 0) return 0;
    
    const completedTasks = goalTasks.filter(task => task.completed).length;
    return Math.round((completedTasks / goalTasks.length) * 100);
  };

  // Handle goal creation with AI-generated content
  const handleCreateGoal = async () => {
    try {
      setIsCreating(true);
      
      // Create the goal first
      const createdGoal = await createGoal(newGoal);
      if (!createdGoal) {
        throw new Error("Failed to create goal");
      }

      // Set the newly created goal as expanded
      setExpandedGoalId(createdGoal.id);
      
      // Generate tasks and quizzes using the edge function
      const response = await supabase.functions.invoke('generate-goal-content', {
        body: {
          title: newGoal.title,
          description: newGoal.description,
          goal_id: createdGoal.id
        }
      });

      if (response.error) {
        throw new Error(`Error generating content: ${response.error.message}`);
      }

      const { data: { tasks: generatedTasks, quizzes } } = response;
      
      // Create tasks and associated quizzes
      const taskPromises = generatedTasks.map(async (task, i) => {
        const taskData = {
          title: task.title,
          description: task.description,
          article_content: task.article_content
        };
        
        const createdTask = await createTask(taskData);
        
        if (createdTask && createdTask.id) {
          // Create quiz for this task
          const quiz = quizzes.find(q => q.task_index === i);
          if (quiz) {
            const { error: quizError } = await supabase
              .from('quizzes')
              .insert([{
                task_id: createdTask.id,
                title: quiz.title,
                questions: quiz.questions
              }]);

            if (quizError) {
              console.error('Error creating quiz:', quizError);
            }
          }
          return createdTask;
        }
        return null;
      });
      
      await Promise.all(taskPromises);
      
      // Refresh tasks to ensure UI is updated
      fetchTasks();

      setNewGoal({ title: "", description: "", target_date: "" });
      setOpenGoalDialog(false);
      toast.success("Financial goal created with AI-generated tasks and quizzes!");
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

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
                Define a financial goal you want to achieve. Tasks and quizzes will be automatically generated to help you reach your goal.
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
              <Button 
                type="submit" 
                onClick={handleCreateGoal}
                disabled={isCreating}
              >
                {isCreating ? 'Creating...' : 'Create Goal'}
              </Button>
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
        tasks={tasks}
        isTasksLoading={isTasksLoading}
        onUpdateTaskStatus={updateTaskStatus}
      />
    </div>
  );
};

export default GoalsPage;
