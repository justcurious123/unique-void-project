
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useTasks } from '@/hooks/useTasks';
import { ArrowLeft, CheckCircle, Loader2, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import TaskQuiz from '@/components/TaskQuiz';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

const GoalDetail = () => {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [goalData, setGoalData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeQuizTaskId, setActiveQuizTaskId] = useState<string | null>(null);
  const { tasks, isLoading: tasksLoading, updateTaskStatus } = useTasks(goalId || '');

  useEffect(() => {
    const fetchGoalDetails = async () => {
      try {
        if (!goalId) return;
        
        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .eq('id', goalId)
          .single();
          
        if (error) throw error;
        setGoalData(data);
      } catch (error: any) {
        toast.error(`Error fetching goal details: ${error.message}`);
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGoalDetails();
  }, [goalId, navigate]);

  const calculateProgress = () => {
    if (!tasks || tasks.length === 0) return 0;
    const completedTasks = tasks.filter(task => task.completed).length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-pattern py-6 px-4 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!goalData) {
    return (
      <div className="min-h-screen bg-pattern py-6 px-4">
        <div className="max-w-4xl mx-auto glass-card p-6 rounded-2xl">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
          <p className="text-center py-10">Goal not found</p>
        </div>
      </div>
    );
  }

  const progressValue = calculateProgress();

  return (
    <div className="min-h-screen bg-pattern py-2 sm:py-8 px-2 sm:px-6">
      <div className="max-w-4xl mx-auto glass-card p-3 sm:p-6 rounded-2xl">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-3 sm:mb-6 h-8 sm:h-10">
          <ArrowLeft className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" /> Back to Dashboard
        </Button>
        
        <Card className={goalData.completed ? "border-green-200 bg-green-50/30 mb-6" : "mb-6"}>
          <CardHeader>
            <div className="flex items-center gap-2">
              {goalData.completed && <CheckCircle className="h-5 w-5 text-green-500" />}
              <CardTitle>{goalData.title}</CardTitle>
            </div>
            <CardDescription>{goalData.description}</CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm">{progressValue}%</span>
            </div>
            <Progress value={progressValue} className="h-2 mb-6" />
            
            {goalData.task_summary && (
              <div className="bg-muted/30 p-4 rounded-md mb-6">
                <h3 className="text-sm font-medium mb-2">Goal Summary</h3>
                <p className="text-sm text-muted-foreground">{goalData.task_summary}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium mb-3">Tasks</h3>
              
              {tasksLoading ? (
                <div className="py-8 flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : activeQuizTaskId ? (
                <div className="mt-4">
                  <TaskQuiz 
                    taskId={activeQuizTaskId} 
                    onClose={() => setActiveQuizTaskId(null)} 
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-start gap-3 p-3 rounded-md border">
                      <Checkbox 
                        id={`task-${task.id}`} 
                        checked={task.completed}
                        onCheckedChange={(checked) => {
                          if (typeof checked === 'boolean') {
                            updateTaskStatus(task.id, checked);
                          }
                        }}
                        className="mt-0.5"
                      />
                      <div className="flex-1 space-y-1">
                        <label 
                          htmlFor={`task-${task.id}`}
                          className={cn(
                            "font-medium cursor-pointer text-sm",
                            task.completed && "line-through text-muted-foreground"
                          )}
                        >
                          {task.title}
                        </label>
                        {task.description && (
                          <p className="text-xs text-muted-foreground">{task.description}</p>
                        )}
                        {task.article_content && (
                          <div className="mt-2 bg-muted/20 p-3 rounded-md">
                            <h4 className="text-xs font-medium mb-1">Learning Resources</h4>
                            <p className="text-xs line-clamp-3">{task.article_content}</p>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="mt-2 h-7 text-xs"
                              onClick={() => setActiveQuizTaskId(task.id)}
                            >
                              <BookOpen className="h-3 w-3 mr-1" /> Take Quiz
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GoalDetail;
