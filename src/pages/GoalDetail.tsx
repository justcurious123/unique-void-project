
import React, { useEffect, useState, useCallback } from 'react';
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
  const { tasks, isLoading: tasksLoading, fetchTasks, updateTaskStatus } = useTasks(goalId || '');
  const [imageLoading, setImageLoading] = useState(false);
  const [creationInProgress, setCreationInProgress] = useState(false);
  const [pollingActive, setPollingActive] = useState(false);
  const [lastPollTime, setLastPollTime] = useState(0);
  const [notFoundError, setNotFoundError] = useState(false);
  const [creationStartTime, setCreationStartTime] = useState(0);

  // Use the custom hook for task ordering
  const { sortedTasks } = useTaskOrder(goalId, tasks, tasksLoading);

  // Create a reusable function to fetch goal details
  const fetchGoalDetails = useCallback(async () => {
    try {
      if (!goalId) return false;
      
      console.log("Fetching goal details for", goalId);
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('id', goalId)
        .single();
          
      if (error) {
        if (error.code === 'PGRST116') {
          // Record not found error - could be a newly created goal that's not in the database yet
          console.log("Goal not found, may be still creating");
          setNotFoundError(true);
          return false;
        }
        throw error;
      }
      
      // If we have a Replicate image URL, force a cache-busting parameter
      let finalImageUrl = data.image_url;
      if (finalImageUrl && finalImageUrl.includes('replicate.delivery')) {
        // Don't add cache-busting parameter yet, we'll add it during render
        // Just make sure the URL is valid
        console.log(`Found Replicate image URL: ${finalImageUrl}`);
      } 
      // If no image URL, set default image
      else if (!finalImageUrl) {
        finalImageUrl = getDefaultImage(data.title);
        console.log(`No image URL, using default: ${finalImageUrl}`);
      }
      
      setGoalData({
        ...data,
        image_url: finalImageUrl
      });

      // Goal exists now, clear not found error
      setNotFoundError(false);

      // If no tasks yet, we assume content generation is still in progress
      const contentGenerationInProgress = !data.task_summary;
      console.log("Content generation in progress:", contentGenerationInProgress);
      setCreationInProgress(contentGenerationInProgress);
      
      // If content generation is complete but we have no tasks, fetch them
      if (!contentGenerationInProgress && tasks.length === 0) {
        console.log("Content generation complete but no tasks loaded, fetching tasks");
        fetchTasks();
      }
      
      return contentGenerationInProgress;
    } catch (error: any) {
      console.error("Error fetching goal details:", error);
      
      if (!notFoundError) {
        // Don't show toast for not found error (PGRST116) as this is expected during initial creation
        if (error.code !== 'PGRST116') {
          toast.error(`Error fetching goal details: ${error.message}`);
        }
      }
      
      // Only navigate to dashboard for severe errors, not for not-found
      // which is expected during goal creation process
      if (error.code !== 'PGRST116') {
        console.log("Severe error, returning to dashboard");
        navigate('/dashboard');
      }
      
      return false;
    } finally {
      setIsLoading(false);
      setImageLoading(false);
    }
  }, [goalId, navigate, fetchTasks, tasks.length, notFoundError]);

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      setImageLoading(true);
      
      // Set the creation start time to measure polling duration
      if (!creationStartTime) {
        setCreationStartTime(Date.now());
      }
      
      const isGenerating = await fetchGoalDetails();
      
      // Start polling if content generation is in progress
      if (isGenerating) {
        console.log("Content generation is in progress, starting polling");
        setPollingActive(true);
        setLastPollTime(Date.now());
      }
    };
    
    loadInitialData();
  }, [fetchGoalDetails, creationStartTime]);

  // Polling mechanism for content generation
  useEffect(() => {
    if (!pollingActive || !goalId) return;
    
    const POLL_INTERVAL = 3000; // 3 seconds
    const MAX_POLLING_TIME = 180000; // 3 minutes (as a safety measure)
    
    const pollForContentGeneration = async () => {
      const now = Date.now();
      const pollingDuration = now - lastPollTime;
      const totalCreationTime = now - creationStartTime;
      
      // Log the polling progress
      console.log(`Polling for content generation: ${Math.round(totalCreationTime/1000)}s elapsed`);
      
      // Safety check to stop polling after MAX_POLLING_TIME
      if (pollingDuration > MAX_POLLING_TIME) {
        console.log("Stopped polling after reaching max polling time");
        setPollingActive(false);
        return;
      }

      console.log("Polling for content generation completion...");
      const isStillGenerating = await fetchGoalDetails();
      
      // If content generation is complete
      if (!isStillGenerating) {
        console.log("Content generation complete, stopping polling");
        setPollingActive(false);
        fetchTasks();
        toast.success("Goal content has been generated successfully!");
      }
    };
    
    const intervalId = setInterval(pollForContentGeneration, POLL_INTERVAL);
    
    // Clean up interval on unmount or when polling stops
    return () => clearInterval(intervalId);
  }, [pollingActive, goalId, fetchGoalDetails, lastPollTime, fetchTasks, creationStartTime]);

  const calculateProgress = () => {
    if (!tasks || tasks.length === 0) return 0;
    const completedTasks = tasks.filter(task => task.completed).length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  const handleTaskStatusChange = async (taskId: string, checked: boolean) => {
    await updateTaskStatus(taskId, checked);
  };

  // If the goal hasn't been found after a reasonable time, show a "creating goal" state
  // instead of redirecting to dashboard
  if (isLoading) {
    return (
      <div className="min-h-screen bg-pattern py-6 px-4 flex flex-col justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-center text-lg font-medium">Loading your goal...</p>
      </div>
    );
  }

  // Show a special not found error for goals that are still being created
  if (notFoundError) {
    return (
      <div className="min-h-screen bg-pattern py-6 px-4">
        <div className="max-w-4xl mx-auto glass-card p-6 rounded-2xl">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
          <div className="text-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg">Setting up your goal...</p>
            <p className="text-sm text-muted-foreground mt-2">
              This process may take a moment as we prepare your goal details.
            </p>
            <p className="text-sm text-muted-foreground mt-6">
              Please wait on this page. It will automatically update when your goal is ready.
            </p>
          </div>
        </div>
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
            
            {creationInProgress ? (
              <CardContent className="py-6 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">
                  AI is generating tasks and quizzes for your goal...
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  This may take a minute or two. The page will update automatically once ready.
                </p>
                <p className="text-sm text-muted-foreground mt-6">
                  Please remain on this page. You don't need to refresh or navigate away.
                </p>
              </CardContent>
            ) : (
              <>
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
              </>
            )}
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
