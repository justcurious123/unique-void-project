
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Goal } from "@/hooks/useGoals";

interface UseGoalCreationProps {
  refreshGoals: () => void;
  createTask: (task: any) => Promise<any>;
  fetchTasks: () => void;
  onGoalCreated: (goalId: string) => void;
}

export const useGoalCreation = ({
  refreshGoals,
  createTask,
  fetchTasks,
  onGoalCreated
}: UseGoalCreationProps) => {
  const [isCreating, setIsCreating] = useState(false);

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

  const handleCreateGoal = async (newGoal: {
    title: string;
    description: string;
    target_date: string;
  }, onCreateGoal: (newGoal: any) => Promise<Goal | null>) => {
    try {
      setIsCreating(true);
      const createdGoal = await onCreateGoal(newGoal);
      if (!createdGoal) {
        throw new Error("Failed to create goal");
      }
      onGoalCreated(createdGoal.id);
      
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
      return true;
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    isCreating,
    handleCreateGoal
  };
};
