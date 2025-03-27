
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import TaskItem from './TaskItem';

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
  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <p className="text-center py-6 text-muted-foreground">No tasks found for this goal.</p>
    );
  }

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
