
import { useState, useEffect } from 'react';
import { Task } from './useTasks';

export const useTaskOrder = (goalId: string | undefined, tasks: Task[], tasksLoading: boolean) => {
  const [taskOrder, setTaskOrder] = useState<string[]>([]);
  const [initialOrderSet, setInitialOrderSet] = useState(false);

  // Initialize task order when tasks are loaded
  useEffect(() => {
    if (!tasksLoading && tasks.length > 0 && !initialOrderSet) {
      const initialOrder = tasks.map(task => task.id);
      console.log('Setting initial task order:', initialOrder);
      setTaskOrder(initialOrder);
      setInitialOrderSet(true);
    }
  }, [tasks, tasksLoading, initialOrderSet]);

  // Save task order to session storage when it changes
  useEffect(() => {
    if (goalId && initialOrderSet) {
      sessionStorage.setItem(`taskOrder-${goalId}`, JSON.stringify(taskOrder));
    }
  }, [taskOrder, goalId, initialOrderSet]);

  // Load task order from session storage on component mount
  useEffect(() => {
    if (goalId) {
      const savedOrder = sessionStorage.getItem(`taskOrder-${goalId}`);
      if (savedOrder) {
        try {
          const parsedOrder = JSON.parse(savedOrder);
          console.log('Retrieved saved task order:', parsedOrder);
          setTaskOrder(parsedOrder);
          setInitialOrderSet(true);
        } catch (error) {
          console.error('Error parsing saved task order:', error);
        }
      }
    }
  }, [goalId]);

  // Sort tasks based on the current task order
  const sortedTasks = [...tasks].sort((a, b) => {
    const aIndex = taskOrder.indexOf(a.id);
    const bIndex = taskOrder.indexOf(b.id);
    
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    
    return aIndex - bIndex;
  });

  return { 
    sortedTasks,
    taskOrder,
    setTaskOrder,
    initialOrderSet
  };
};
