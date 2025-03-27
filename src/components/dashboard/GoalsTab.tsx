
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { GoalList } from "@/components/GoalList";
import { useGoals } from "@/hooks/useGoals";
import { useTasks } from "@/hooks/useTasks";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const GoalsTab = () => {
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const [goalTasksCache, setGoalTasksCache] = useState<Record<string, any[]>>({});
  const [openGoalDialog, setOpenGoalDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    target_date: ""
  });

  const {
    goals,
    createGoal,
    deleteGoal,
    refreshGoals
  } = useGoals();
  
  const {
    tasks,
    isLoading: isTasksLoading,
    fetchTasks,
    updateTaskStatus,
    createTask
  } = useTasks(expandedGoalId || "");

  React.useEffect(() => {
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
    const cachedTasks = goalTasksCache[goalId] || [];
    const goalTasks = expandedGoalId === goalId ? tasks : cachedTasks;
    if (goalTasks.length === 0) {
      return 0;
    }
    const completedTasks = goalTasks.filter(task => task.completed).length;
    return Math.round(completedTasks / goalTasks.length * 100);
  };

  const generateTaskSummary = async (tasks: any[]) => {
    try {
      if (!tasks || tasks.length === 0) return "";
      const taskTitles = tasks.map(t => t.title).join(", ");
      const response = await supabase.functions.invoke('generate-task-summary', {
        body: {
          tasks
        }
      });
      if (response.error) {
        throw new Error(`Error generating summary: ${response.error.message}`);
      }
      return response.data?.summary || `Includes tasks: ${taskTitles}`;
    } catch (error) {
      console.error("Error generating task summary:", error);
      return "";
    }
  };

  const handleCreateGoal = async () => {
    try {
      setIsCreating(true);
      const createdGoal = await createGoal(newGoal);
      if (!createdGoal) {
        throw new Error("Failed to create goal");
      }
      setExpandedGoalId(createdGoal.id);
      
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
      
      const {
        data: {
          tasks: generatedTasks,
          quizzes,
          goal_id
        }
      } = response;
      
      if (!goal_id || goal_id !== createdGoal.id) {
        console.warn("Goal ID mismatch. Using created goal ID:", createdGoal.id);
      }
      
      toast.info("Generating goal image...");
      try {
        const imageResponse = await supabase.functions.invoke('generate-goal-image', {
          body: {
            goalTitle: newGoal.title,
            goalId: createdGoal.id
          }
        });
        
        if (imageResponse.error) {
          console.error("Error generating goal image:", imageResponse.error);
          toast.error("Failed to generate goal image, but goal was created successfully");
        } else {
          console.log("Goal image generated:", imageResponse.data);
          if (imageResponse.data?.prompt) {
            console.log("Using custom prompt:", imageResponse.data.prompt);
          }
        }
      } catch (imageError) {
        console.error("Error invoking image generation:", imageError);
      }
      
      const taskPromises = generatedTasks.map(async (task, i) => {
        const taskData = {
          title: task.title,
          description: task.description,
          article_content: task.article_content
        };
        
        const createdTask = await createTask({
          ...taskData,
          goal_id: createdGoal.id
        });
        
        if (createdTask && createdTask.id) {
          const quiz = quizzes.find(q => q.task_index === i);
          if (quiz) {
            const { error: quizError } = await supabase.from('quizzes').insert([{
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
      
      const createdTasks = (await Promise.all(taskPromises)).filter(Boolean);
      const taskSummary = await generateTaskSummary(createdTasks);
      
      if (taskSummary) {
        const { error: updateError } = await supabase.from('goals').update({
          task_summary: taskSummary
        }).eq('id', createdGoal.id);
        
        if (updateError) {
          console.error('Error updating goal with task summary:', updateError);
        } else {
          refreshGoals();
        }
      }
      
      fetchTasks();
      setNewGoal({
        title: "",
        description: "",
        target_date: ""
      });
      setOpenGoalDialog(false);
      toast.success("Financial goal created with AI-generated tasks and quizzes!");
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-6">
      <div className="bg-white/10 p-3 sm:p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">My Goals</h2>
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
                    onChange={e => setNewGoal({
                      ...newGoal,
                      title: e.target.value
                    })} 
                  />
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <Input 
                    id="description" 
                    placeholder="Briefly describe your goal" 
                    value={newGoal.description} 
                    onChange={e => setNewGoal({
                      ...newGoal,
                      description: e.target.value
                    })} 
                  />
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="target_date" className="text-sm font-medium">Target Date</label>
                  <Input 
                    id="target_date" 
                    type="date" 
                    value={newGoal.target_date} 
                    onChange={e => setNewGoal({
                      ...newGoal,
                      target_date: e.target.value
                    })} 
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="submit" onClick={handleCreateGoal} disabled={isCreating}>
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
    </div>
  );
};

export default GoalsTab;
