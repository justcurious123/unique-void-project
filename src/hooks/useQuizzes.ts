
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
      
      // Safely type and parse the JSON questions
      const parsedQuestions = data.questions as any[];
      const typedQuestions: QuizQuestion[] = parsedQuestions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correct_option: q.correct_option
      }));
      
      const quiz: Quiz = {
        id: data.id,
        task_id: data.task_id,
        title: data.title,
        questions: typedQuestions
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
