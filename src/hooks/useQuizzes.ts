
import { useState } from 'react';
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
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }
      
      return data as Quiz;
    } catch (error: any) {
      toast.error(`Error fetching quiz: ${error.message}`);
      return null;
    }
  };

  return {
    fetchQuiz
  };
};
