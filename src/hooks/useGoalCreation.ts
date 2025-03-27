
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

  // Extract task summary generation to a separate function
  const generateTaskSummary = async (tasks: any[]) => {
    try {
      if (!tasks || tasks.length === 0) return "";
      const taskTitles = tasks.map(t => t.title).join(", ");
      
      const response = await supabase.functions.invoke('generate-task-summary', {
        body: { tasks }
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

  // Extract goal content generation to a separate function
  const generateGoalContent = async (goalTitle: string, goalDescription: string, goalId: string) => {
    try {
      const response = await supabase.functions.invoke('generate-goal-content', {
        body: {
          title: goalTitle,
          description: goalDescription,
          goal_id: goalId
        }
      });
      
      if (response.error) {
        throw new Error(`Error generating content: ${response.error.message}`);
      }
      
      return response.data;
    } catch (error) {
      console.error("Error generating goal content:", error);
      throw error;
    }
  };

  // Extract goal image generation to a separate function
  const generateGoalImage = async (goalTitle: string, goalId: string) => {
    try {
      toast.info("Generating goal image...");
      
      const imageResponse = await supabase.functions.invoke('generate-goal-image', {
        body: {
          goalTitle,
          goalId
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
  };

  // Extract task creation to a separate function
  const createTasksWithQuizzes = async (
    generatedTasks: any[], 
    quizzes: any[], 
    goalId: string
  ) => {
    try {
      const taskPromises = generatedTasks.map(async (task, i) => {
        const taskData = {
          title: task.title,
          description: task.description,
          article_content: task.article_content
        };
        
        const createdTask = await createTask({
          ...taskData,
          goal_id: goalId
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
      
      return (await Promise.all(taskPromises)).filter(Boolean);
    } catch (error) {
      console.error("Error creating tasks and quizzes:", error);
      throw error;
    }
  };

  // Extract goal update with task summary to a separate function
  const updateGoalWithTaskSummary = async (goalId: string, taskSummary: string) => {
    try {
      if (!taskSummary) return;
      
      const { error: updateError } = await supabase.from('goals').update({
        task_summary: taskSummary
      }).eq('id', goalId);
      
      if (updateError) {
        console.error('Error updating goal with task summary:', updateError);
      }
    } catch (error) {
      console.error("Error updating goal with task summary:", error);
    }
  };

  // Main function to handle goal creation, now using the extracted functions
  const handleCreateGoal = async (newGoal: {
    title: string;
    description: string;
    target_date: string;
  }, onCreateGoal: (newGoal: any) => Promise<Goal | null>) => {
    try {
      setIsCreating(true);
      
      // Step 1: Create the base goal
      const createdGoal = await onCreateGoal(newGoal);
      if (!createdGoal) {
        throw new Error("Failed to create goal");
      }
      
      // Let the parent component know which goal was created
      onGoalCreated(createdGoal.id);
      
      // Step 2: Generate goal content (tasks and quizzes)
      const contentResult = await generateGoalContent(
        newGoal.title, 
        newGoal.description, 
        createdGoal.id
      );
      
      const { tasks: generatedTasks, quizzes, goal_id } = contentResult;
      
      if (!goal_id || goal_id !== createdGoal.id) {
        console.warn("Goal ID mismatch. Using created goal ID:", createdGoal.id);
      }
      
      // Step 3: Generate goal image in parallel
      generateGoalImage(newGoal.title, createdGoal.id);
      
      // Step 4: Create tasks and quizzes
      const createdTasks = await createTasksWithQuizzes(
        generatedTasks,
        quizzes,
        createdGoal.id
      );
      
      // Step 5: Generate and update task summary
      const taskSummary = await generateTaskSummary(createdTasks);
      await updateGoalWithTaskSummary(createdGoal.id, taskSummary);
      
      // Step 6: Refresh goals if task summary was updated
      if (taskSummary) {
        refreshGoals();
      }
      
      // Step 7: Fetch tasks to update the UI
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
