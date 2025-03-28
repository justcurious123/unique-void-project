
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Create tasks and associated quizzes
export const createTasksWithQuizzes = async (
  generatedTasks: any[], 
  quizzes: any[], 
  goalId: string,
  createTask: (task: any) => Promise<any>
) => {
  try {
    if (!generatedTasks || generatedTasks.length === 0) {
      console.warn("No tasks to create for goal:", goalId);
      return [];
    }
    
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
        // Find corresponding quiz
        const quiz = quizzes.find(q => q.task_index === i);
        if (quiz) {
          console.log(`Creating quiz for task: ${createdTask.id}`);
          
          try {
            const { error: quizError } = await supabase.from('quizzes').insert([{
              task_id: createdTask.id,
              title: quiz.title,
              questions: quiz.questions
            }]);
            
            if (quizError) {
              console.error('Error creating quiz:', quizError);
            }
          } catch (quizError) {
            console.error('Exception creating quiz:', quizError);
          }
        }
        return createdTask;
      }
      return null;
    });
    
    return (await Promise.all(taskPromises)).filter(Boolean);
  } catch (error) {
    console.error("Error creating tasks and quizzes:", error);
    toast.error("Error creating tasks. You may need to refresh the page.");
    return [];
  }
};

// Generate a summary of tasks
export const generateTaskSummary = async (tasks: any[]) => {
  try {
    if (!tasks || tasks.length === 0) {
      console.log("No tasks available for summary generation");
      return "";
    }
    
    const taskTitles = tasks.map(t => t.title).join(", ");
    console.log("Generating summary for tasks:", taskTitles);
    
    const response = await supabase.functions.invoke('generate-task-summary', {
      body: { tasks }
    });
    
    if (response.error) {
      console.error(`Error generating summary: ${response.error.message}`);
      return `Includes tasks: ${taskTitles}`;
    }
    
    return response.data?.summary || `Includes tasks: ${taskTitles}`;
  } catch (error) {
    console.error("Error generating task summary:", error);
    return "";
  }
};

// Update goal with task summary
export const updateGoalWithTaskSummary = async (goalId: string, taskSummary: string) => {
  try {
    if (!taskSummary) {
      console.log("No task summary to update for goal:", goalId);
      return;
    }
    
    console.log(`Updating goal ${goalId} with task summary`);
    
    const { error: updateError } = await supabase.from('goals').update({
      task_summary: taskSummary
    }).eq('id', goalId);
    
    if (updateError) {
      console.error('Error updating goal with task summary:', updateError);
    } else {
      console.log(`Goal ${goalId} updated with task summary successfully`);
    }
  } catch (error) {
    console.error("Error updating goal with task summary:", error);
  }
};
