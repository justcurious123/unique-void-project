
import { useState } from "react";
import { toast } from "sonner";
import { Goal } from "@/hooks/types/goalTypes";
import { 
  generateGoalContent, 
  generateGoalImage 
} from "@/utils/goalContentGenerator";
import { 
  createTasksWithQuizzes, 
  generateTaskSummary, 
  updateGoalWithTaskSummary 
} from "@/utils/taskProcessor";

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

  // Main function to handle goal creation, returning the goal ID for navigation
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
          createdGoal.id,
          createTask
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
