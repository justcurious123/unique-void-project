
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTasks } from '@/hooks/useTasks';
import { cn } from '@/lib/utils';
import TaskQuiz from '@/components/TaskQuiz';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { getDefaultImage } from '@/utils/goalImages';
import GoalImage from '@/components/goal-detail/GoalImage';
import GoalProgress from '@/components/goal-detail/GoalProgress';
import TasksSection from '@/components/goal-detail/TasksSection';
import { useTaskOrder } from '@/hooks/useTaskOrder';

const GoalDetail = () => {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [goalData, setGoalData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeQuizTaskId, setActiveQuizTaskId] = useState<string | null>(null);
  const { tasks, isLoading: tasksLoading, updateTaskStatus } = useTasks(goalId || '');
  const [imageLoading, setImageLoading] = useState(false);

  // Use the custom hook for task ordering
  const { sortedTasks } = useTaskOrder(goalId, tasks, tasksLoading);

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
        
        if (!data.image_url) {
          data.image_url = getDefaultImage(data.title);
        }
        
        setImageLoading(true);
        const img = new Image();
        img.onload = () => {
          setImageLoading(false);
        };
        img.onerror = () => {
          console.log("Image failed to load in GoalDetail, using default");
          data.image_url = getDefaultImage(data.title);
          setImageLoading(false);
        };
        img.src = data.image_url;
        
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

  const handleTaskStatusChange = async (taskId: string, checked: boolean) => {
    await updateTaskStatus(taskId, checked);
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
          <p className="text-center py-10 text-base md:text-lg">Goal not found</p>
        </div>
      </div>
    );
  }

  const progressValue = calculateProgress();
  const hasImage = !!goalData.image_url;

  return (
    <div className="min-h-screen bg-pattern py-2 sm:py-8 px-2 sm:px-6">
      <div className="max-w-4xl mx-auto glass-card p-0 rounded-2xl overflow-hidden">
        {hasImage && (
          <GoalImage 
            imageUrl={goalData.image_url}
            title={goalData.title}
            isLoading={imageLoading}
          />
        )}
        
        <div className="p-3 sm:p-6">
          {!hasImage && (
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
            
            <GoalProgress 
              progressValue={progressValue}
              summary={goalData.task_summary}
            />
            
            <TasksSection
              tasks={sortedTasks}
              isLoading={tasksLoading}
              onStatusChange={handleTaskStatusChange}
              onQuizStart={setActiveQuizTaskId}
            />
          </Card>
          
          {activeQuizTaskId && (
            <TaskQuiz 
              taskId={activeQuizTaskId} 
              onClose={() => setActiveQuizTaskId(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalDetail;
