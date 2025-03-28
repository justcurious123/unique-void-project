
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
      console.log(`Generating content for goal: ${goalTitle} (${goalId})`);
      
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
      console.log(`Generating image for goal: ${goalTitle} (${goalId})`);
      
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
      console.log(`Creating ${generatedTasks.length} tasks for goal ${goalId}`);
      
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
            console.log(`Creating quiz for task: ${createdTask.id}`);
            
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
      
      console.log(`Updating goal ${goalId} with task summary`);
      
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

  // Main function to handle goal creation, now returning the goal ID for navigation
  const handleCreateGoal = async (newGoal: {
    title: string;
    description: string;
    target_date: string;
  }, onCreateGoal: (newGoal: any) => Promise<Goal | null>) => {
    try {
      setIsCreating(true);
      
      // Step 1: Create the base goal
      console.log("Creating new goal:", newGoal.title);
      const createdGoal = await onCreateGoal(newGoal);
      if (!createdGoal) {
        throw new Error("Failed to create goal");
      }
      
      console.log("Goal created with ID:", createdGoal.id);
      
      // Step 2: Let the parent component know a goal was created and navigate
      // This is crucial - we immediately navigate to goal detail while content generates
      onGoalCreated(createdGoal.id);
      
      // Step 3: Start background generation of content
      generateGoalContent(
        newGoal.title, 
        newGoal.description, 
        createdGoal.id
      ).then(async (contentResult) => {
        const { tasks: generatedTasks, quizzes, goal_id } = contentResult;
        
        if (!goal_id || goal_id !== createdGoal.id) {
          console.warn("Goal ID mismatch. Using created goal ID:", createdGoal.id);
        }
        
        // Step 4: Generate goal image in parallel
        generateGoalImage(newGoal.title, createdGoal.id);
        
        // Step 5: Create tasks and quizzes
        const createdTasks = await createTasksWithQuizzes(
          generatedTasks,
          quizzes,
          createdGoal.id
        );
        
        // Step 6: Generate and update task summary
        const taskSummary = await generateTaskSummary(createdTasks);
        await updateGoalWithTaskSummary(createdGoal.id, taskSummary);
        
        // Step 7: Refresh goals to update the dashboard
        if (taskSummary) {
          refreshGoals();
        }
        
        // Step 8: Fetch tasks to update the UI if still on the goal detail page
        fetchTasks();
        
        // Show a completion notification
        toast.success("Your financial goal has been created successfully!");
      }).catch(error => {
        console.error("Error generating goal content:", error);
        toast.error("Error generating goal content, but goal was created");
      });
      
      // Return the goal ID for immediate navigation
      return createdGoal.id;
    } catch (error: any) {
      console.error("Error in handleCreateGoal:", error);
      toast.error(`Error: ${error.message}`);
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    isCreating,
    handleCreateGoal
  };
};
