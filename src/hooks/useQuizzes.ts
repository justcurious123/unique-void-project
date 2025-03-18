
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_option: number;
}

export interface Quiz {
  id: string;
  task_id: string;
  title: string;
  questions: QuizQuestion[];
}

export const useQuizzes = () => {
  const fetchQuiz = async (taskId: string) => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('task_id', taskId)
        .maybeSingle();
        
      if (error) {
        throw error;
      }
      
      if (!data) return null;
      
      // Parse the JSON questions into our QuizQuestion type
      const quiz: Quiz = {
        id: data.id,
        task_id: data.task_id,
        title: data.title,
        questions: data.questions as QuizQuestion[]
      };
      
      return quiz;
    } catch (error: any) {
      toast.error(`Error fetching quiz: ${error.message}`);
      return null;
    }
  };

  return {
    fetchQuiz
  };
};
