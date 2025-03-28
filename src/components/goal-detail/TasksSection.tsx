
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import TaskItem from './TaskItem';
import { Skeleton } from '@/components/ui/skeleton';

interface TasksSectionProps {
  tasks: Task[];
  isLoading: boolean;
  onStatusChange: (taskId: string, checked: boolean) => Promise<void>;
  onQuizStart: (taskId: string) => void;
}

const TasksSection = ({ 
  tasks,
  isLoading,
  onStatusChange,
  onQuizStart
}: TasksSectionProps) => {
  // Show stable loading UI that doesn't cause layout shifts
  if (isLoading && tasks.length === 0) {
    return (
      <CardContent className="pt-0">
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-medium">Tasks</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                <Skeleton className="h-5 w-5 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    );
  }

  // Empty state handling
  if (tasks.length === 0) {
    return (
      <CardContent className="pt-0">
        <div className="py-8 flex flex-col items-center justify-center space-y-4">
          <p className="text-center text-muted-foreground">
            Your tasks are being prepared...
          </p>
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            This will only take a moment. Please stay on this page.
          </p>
        </div>
      </CardContent>
    );
  }

  // Display tasks
  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <CardContent className="pt-0">
      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-medium">Tasks</h3>
        <div className="space-y-3">
          {activeTasks.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">In Progress</h4>
              {activeTasks.map(task => (
                <TaskItem 
                  key={task.id}
                  task={task}
                  onStatusChange={onStatusChange}
                  onQuizStart={onQuizStart}
                />
              ))}
            </div>
          )}
          
          {completedTasks.length > 0 && (
            <div className="space-y-3 mt-6">
              <h4 className="text-sm font-medium text-muted-foreground">Completed</h4>
              {completedTasks.map(task => (
                <TaskItem 
                  key={task.id}
                  task={task}
                  onStatusChange={onStatusChange}
                  onQuizStart={onQuizStart}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </CardContent>
  );
};

export default TasksSection;
