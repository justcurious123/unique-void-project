
import { useState, useEffect } from 'react';
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
  goal_id?: string; // Make goal_id optional in the interface but ensure it's set
}

export const useTasks = (goalId: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTasks = async () => {
    try {
      // Only fetch tasks if we have a valid goalId
      if (!goalId) {
        console.log('No goal ID provided, skipping task fetch');
        return;
      }

      setIsLoading(true);
      console.log(`Fetching tasks for goal ID: ${goalId}`);

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('goal_id', goalId)
        .order('order_number', { ascending: true });
        
      if (error) throw error;
      
      console.log(`Found ${data?.length || 0} tasks for goal ID: ${goalId}`);
      setTasks(data || []);
    } catch (error: any) {
      console.error('Error fetching tasks:', error.message);
      toast.error(`Error fetching tasks: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch tasks whenever goalId changes
  useEffect(() => {
    if (goalId) {
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [goalId]);

  const createTask = async (newTask: NewTask) => {
    try {
      // Ensure we have a goal_id - either from the parameter or from the current context
      const effectiveGoalId = newTask.goal_id || goalId;
      
      if (!effectiveGoalId) {
        console.error('No goal ID provided for task creation');
        toast.error('Cannot create task: No goal specified');
        return null;
      }
      
      console.log(`Creating task for goal ID: ${effectiveGoalId}`);
      
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          { 
            title: newTask.title,
            description: newTask.description,
            article_content: newTask.article_content,
            goal_id: effectiveGoalId,
            order_number: tasks.length,
            completed: false
          }
        ])
        .select();
        
      if (error) throw error;
      
      if (data) {
        console.log('Task created successfully:', data[0]);
        setTasks([...tasks, ...data]);
        toast.success("Task added to goal successfully!");
        return data[0];  // Return the created task
      }
      return null;
    } catch (error: any) {
      console.error('Error creating task:', error.message);
      toast.error(`Error creating task: ${error.message}`);
      return null;
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
    isLoading,
    fetchTasks,
    createTask,
    updateTaskStatus
  };
};
