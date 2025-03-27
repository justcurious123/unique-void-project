
import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Task } from '@/hooks/useTasks';

interface TaskItemProps {
  task: Task;
  onStatusChange: (id: string, checked: boolean) => void;
  onQuizStart: (id: string) => void;
}

const TaskItem = ({ task, onStatusChange, onQuizStart }: TaskItemProps) => {
  const [isArticleExpanded, setIsArticleExpanded] = useState(false);

  return (
    <div className="flex items-start gap-3 p-4 rounded-md border">
      <Checkbox 
        id={`task-${task.id}`} 
        checked={task.completed}
        onCheckedChange={(checked) => {
          if (typeof checked === 'boolean') {
            onStatusChange(task.id, checked);
          }
        }}
        className="mt-1"
      />
      <div className="flex-1 space-y-2">
        <label 
          htmlFor={`task-${task.id}`}
          className={cn(
            "font-medium cursor-pointer text-base sm:text-lg",
            task.completed && "line-through text-muted-foreground"
          )}
        >
          {task.title}
        </label>
        {task.description && (
          <p className="text-sm sm:text-base text-muted-foreground">{task.description}</p>
        )}
        {task.article_content && (
          <div className="mt-3 bg-muted/20 p-4 rounded-md">
            <h4 className="text-sm sm:text-base font-medium mb-2">Learning Resources</h4>
            
            <Collapsible
              open={isArticleExpanded}
              onOpenChange={() => setIsArticleExpanded(!isArticleExpanded)}
              className="w-full"
            >
              <div className="flex flex-col space-y-2">
                <p className={cn(
                  "text-sm sm:text-base",
                  !isArticleExpanded && "line-clamp-3"
                )}>
                  {task.article_content}
                </p>
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="self-start h-7 sm:h-8 text-xs sm:text-sm mt-1 px-2"
                  >
                    {isArticleExpanded ? (
                      <><ChevronUp className="h-3 w-3 mr-1" /> Show Less</>
                    ) : (
                      <><ChevronDown className="h-3 w-3 mr-1" /> Read More</>
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="pt-1" />
            </Collapsible>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2 h-8 text-sm"
              onClick={() => onQuizStart(task.id)}
            >
              <BookOpen className="h-3 w-3 mr-1" /> Take Quiz
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
