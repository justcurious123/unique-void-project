import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useTasks } from '@/hooks/useTasks';
import { ArrowLeft, CheckCircle, Loader2, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import TaskQuiz from '@/components/TaskQuiz';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const GoalDetail = () => {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [goalData, setGoalData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeQuizTaskId, setActiveQuizTaskId] = useState<string | null>(null);
  const { tasks, isLoading: tasksLoading, updateTaskStatus } = useTasks(goalId || '');
  const [expandedArticles, setExpandedArticles] = useState<Record<string, boolean>>({});
  const [taskOrder, setTaskOrder] = useState<string[]>([]);
  const [initialOrderSet, setInitialOrderSet] = useState(false);

  const toggleArticleExpansion = (taskId: string) => {
    setExpandedArticles(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

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

  useEffect(() => {
    if (!tasksLoading && tasks.length > 0 && !initialOrderSet) {
      const initialOrder = tasks.map(task => task.id);
      console.log('Setting initial task order:', initialOrder);
      setTaskOrder(initialOrder);
      setInitialOrderSet(true);
    }
  }, [tasks, tasksLoading, initialOrderSet]);

  useEffect(() => {
    if (goalId && initialOrderSet) {
      sessionStorage.setItem(`taskOrder-${goalId}`, JSON.stringify(taskOrder));
    }
  }, [taskOrder, goalId, initialOrderSet]);

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

  const calculateProgress = () => {
    if (!tasks || tasks.length === 0) return 0;
    const completedTasks = tasks.filter(task => task.completed).length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  const handleTaskStatusChange = async (taskId: string, checked: boolean) => {
    await updateTaskStatus(taskId, checked);
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const aIndex = taskOrder.indexOf(a.id);
    const bIndex = taskOrder.indexOf(b.id);
    
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    
    return aIndex - bIndex;
  });

  const activeTasks = sortedTasks.filter(task => !task.completed);
  const completedTasks = sortedTasks.filter(task => task.completed);

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
          <p className="text-center py-10 text-base md:text-lg">Goal not found</p>
        </div>
      </div>
    );
  }

  const progressValue = calculateProgress();

  const renderTask = (task: any) => (
    <div key={task.id} className="flex items-start gap-3 p-4 rounded-md border">
      <Checkbox 
        id={`task-${task.id}`} 
        checked={task.completed}
        onCheckedChange={(checked) => {
          if (typeof checked === 'boolean') {
            handleTaskStatusChange(task.id, checked);
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
              open={expandedArticles[task.id]}
              onOpenChange={() => toggleArticleExpansion(task.id)}
              className="w-full"
            >
              <div className="flex flex-col space-y-2">
                <p className={cn(
                  "text-sm sm:text-base",
                  !expandedArticles[task.id] && "line-clamp-3"
                )}>
                  {task.article_content}
                </p>
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="self-start h-7 sm:h-8 text-xs sm:text-sm mt-1 px-2"
                  >
                    {expandedArticles[task.id] ? (
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
              onClick={() => setActiveQuizTaskId(task.id)}
            >
              <BookOpen className="h-3 w-3 mr-1" /> Take Quiz
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-pattern py-2 sm:py-8 px-2 sm:px-6">
      <div className="max-w-4xl mx-auto glass-card p-0 rounded-2xl overflow-hidden">
        {goalData.image_url && (
          <div className="relative">
            <div 
              className="w-full h-48 sm:h-64 bg-cover bg-center"
              style={{ backgroundImage: `url(${goalData.image_url})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
            </div>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')} 
              className="absolute top-3 left-3 h-8 sm:h-10 text-sm sm:text-base bg-white/50 backdrop-blur-sm"
            >
              <ArrowLeft className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" /> Back to Dashboard
            </Button>
          </div>
        )}
        
        <div className="p-3 sm:p-6">
          {!goalData.image_url && (
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-3 sm:mb-6 h-8 sm:h-10 text-sm sm:text-base">
              <ArrowLeft className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" /> Back to Dashboard
            </Button>
          )}
          
          <Card className={goalData.completed ? "border-green-200 bg-green-50/30 mb-6" : "mb-6"}>
            <CardHeader>
              <div className="flex items-center gap-2">
                {goalData.completed && <CheckCircle className="h-5 w-5 text-green-500" />}
                <CardTitle className="text-xl sm:text-2xl">{goalData.title}</CardTitle>
              </div>
              <CardDescription className="text-base sm:text-lg mt-1">{goalData.description}</CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="flex justify-between items-center mb-2">
                <span className="text-base sm:text-lg font-medium">Overall Progress</span>
                <span className="text-base sm:text-lg">{progressValue}%</span>
              </div>
              <Progress value={progressValue} className="h-3 mb-6" />
              
              {goalData.task_summary && (
                <div className="bg-muted/30 p-4 rounded-md mb-6">
                  <h3 className="text-base sm:text-lg font-medium mb-2">Goal Summary</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">{goalData.task_summary}</p>
                </div>
              )}
              


