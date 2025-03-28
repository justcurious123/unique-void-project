
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Function to generate content for a goal (tasks, quizzes)
export const generateGoalContent = async (goalTitle: string, goalDescription: string, goalId: string) => {
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
    
    console.log(`Content generation successful for goal: ${goalId}`);
    return response.data;
  } catch (error) {
    console.error("Error generating goal content:", error);
    toast.error("Failed to generate goal content. Please try refreshing the page.");
    throw error;
  }
};

// Generate an image for the goal
export const generateGoalImage = async (goalTitle: string, goalId: string) => {
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
      return null;
    } else {
      console.log("Goal image generated successfully:", imageResponse.data);
      if (imageResponse.data?.prompt) {
        console.log("Using custom prompt:", imageResponse.data.prompt);
      }
      return imageResponse.data;
    }
  } catch (imageError) {
    console.error("Error invoking image generation:", imageError);
    return null;
  }
};
