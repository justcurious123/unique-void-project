
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
  const fetchQuiz = async (taskId: string): Promise<Quiz | null> => {
    if (!taskId) {
      console.error("No task ID provided for quiz fetch");
      return null;
    }
    
    try {
      console.log(`Fetching quiz for task ID: ${taskId}`);
      
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('task_id', taskId)
        .maybeSingle();
        
      if (error) {
        console.error("Supabase error fetching quiz:", error);
        throw error;
      }
      
      if (!data) {
        console.log(`No quiz found for task ID: ${taskId}`);
        return null;
      }
      
      // Safely parse and validate the questions
      let typedQuestions: QuizQuestion[] = [];
      
      if (data.questions && Array.isArray(data.questions)) {
        typedQuestions = data.questions.map((q: any) => ({
          id: q.id || `q-${Math.random().toString(36).substring(2, 9)}`,
          question: q.question || '',
          options: Array.isArray(q.options) ? q.options : [],
          correct_option: typeof q.correct_option === 'number' ? q.correct_option : 0
        }));
      } else {
        console.error("Invalid quiz questions format:", data.questions);
        return null;
      }
      
      const quiz: Quiz = {
        id: data.id,
        task_id: data.task_id,
        title: data.title || "Quiz",
        questions: typedQuestions
      };
      
      console.log(`Successfully fetched quiz with ${typedQuestions.length} questions`);
      return quiz;
    } catch (error: any) {
      console.error("Error in fetchQuiz:", error);
      throw new Error(`Error fetching quiz: ${error.message}`);
    }
  };

  return {
    fetchQuiz
  };
};
