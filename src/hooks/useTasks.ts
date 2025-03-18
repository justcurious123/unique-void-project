
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Task {
  id: string;
  goal_id: string;
  title: string;
  description: string | null;
  order_number: number;
  completed: boolean;
  article_content: string | null;
  created_at: string;
}

export interface NewTask {
  title: string;
  description: string;
  article_content: string;
}

export const useTasks = (goalId: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('goal_id', goalId)
        .order('order_number', { ascending: true });
        
      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      toast.error(`Error fetching tasks: ${error.message}`);
    }
  };

  const createTask = async (newTask: NewTask) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          { 
            ...newTask,
            goal_id: goalId,
            order_number: tasks.length,
            completed: false
          }
        ])
        .select();
        
      if (error) throw error;
      
      if (data) {
        setTasks([...tasks, ...data]);
        toast.success("Task added to goal successfully!");
      }
      return true;
    } catch (error: any) {
      toast.error(`Error creating task: ${error.message}`);
      return false;
    }
  };

  const updateTaskStatus = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', taskId);
        
      if (error) throw error;
      
      setTasks(tasks.map(t => 
        t.id === taskId ? { ...t, completed } : t
      ));
      return true;
    } catch (error: any) {
      toast.error(`Error updating task status: ${error.message}`);
      return false;
    }
  };

  return {
    tasks,
    fetchTasks,
    createTask,
    updateTaskStatus
  };
};
