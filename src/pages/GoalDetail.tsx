
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
  const { 
    tasks, 
    isLoading: tasksLoading, 
    fetchTasks, 
    updateTaskStatus 
  } = useTasks(goalId || '');
  
  const [creationInProgress, setCreationInProgress] = useState(false);
  const [notFoundError, setNotFoundError] = useState(false);
  const [pollingActive, setPollingActive] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [creationStartTime, setCreationStartTime] = useState(0);
  const [maxPollingReached, setMaxPollingReached] = useState(false);
  const [lastPollTimestamp, setLastPollTimestamp] = useState(0);
  
  // Use the custom hook for task ordering
  const { sortedTasks } = useTaskOrder(goalId, tasks, tasksLoading);

  // Improve fetch goal details to be more efficient and stable
  const fetchGoalDetails = useCallback(async (silent = false) => {
    if (!goalId) return false;
    
    if (!silent) {
      console.log(`Fetching goal details for ${goalId}`);
    }

    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('id', goalId)
        .maybeSingle(); // Using maybeSingle to avoid errors if no goal found
          
      if (error) {
        console.error("Error fetching goal details:", error);
        return false;
      }
      
      // Handle not found case
      if (!data) {
        if (!silent) {
          console.log("Goal not found, may still be in creation process");
        }
        setNotFoundError(true);
        return false;
      }
      
      // If we found the goal, clear not found error
      setNotFoundError(false);
      
      // Determine if the image URL is valid
      let finalImageUrl = data.image_url;
      if (!finalImageUrl) {
        finalImageUrl = getDefaultImage(data.title);
      }
      
      // Update goal data state
      setGoalData({
        ...data,
        image_url: finalImageUrl
      });

      // Check if content generation is still in progress
      const contentGenerationInProgress = !data.task_summary;
      if (!silent) {
        console.log("Content generation in progress:", contentGenerationInProgress);
      }
      setCreationInProgress(contentGenerationInProgress);
      
      // If content generation is complete but we have no tasks, fetch them
      if (!contentGenerationInProgress && tasks.length === 0 && !tasksLoading) {
        fetchTasks();
      }
      
      return contentGenerationInProgress;
    } catch (error: any) {
      if (!silent) {
        console.error("Error fetching goal details:", error);
      }
      
      if (error.code !== 'PGRST116') {
        toast.error(`Error loading goal: ${error.message}`);
      }
      
      return false;
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, [goalId, fetchTasks, tasks.length, tasksLoading]);

  // Initial data load - simplified to prevent race conditions
  useEffect(() => {
    let isMounted = true;
    
    const loadInitialData = async () => {
      if (!isMounted) return;
      
      setIsLoading(true);
      
      // Set the creation start time to measure polling duration
      if (!creationStartTime) {
        setCreationStartTime(Date.now());
      }
      
      const isGenerating = await fetchGoalDetails();
      
      // Start polling if content generation is in progress or goal not found yet
      if ((isGenerating || notFoundError) && isMounted) {
        setPollingActive(true);
        setLastPollTimestamp(Date.now());
        setPollCount(0);
      } else {
        setPollingActive(false);
      }
      
      if (isMounted) {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
    
    return () => {
      isMounted = false;
    };
  }, [fetchGoalDetails, creationStartTime, notFoundError]);

  // Polling mechanism - improved to be more reliable and less flickery
  useEffect(() => {
    if (!pollingActive || !goalId) return;
    
    const POLL_INTERVAL = 3000; // 3 seconds
    const MAX_POLLING_TIME = 180000; // 3 minutes
    const MAX_POLL_COUNT = 60; // Maximum number of polls
    
    let pollingTimerId: number | undefined;
    
    const pollForContentGeneration = async () => {
      const now = Date.now();
      const timeSinceLastPoll = now - lastPollTimestamp;
      
      // Only poll if enough time has passed since last poll
      if (timeSinceLastPoll < POLL_INTERVAL) {
        return;
      }
      
      const newPollCount = pollCount + 1;
      setPollCount(newPollCount);
      setLastPollTimestamp(now);
      
      const pollingDuration = now - creationStartTime;
      
      // Safety check to stop polling after MAX_POLLING_TIME or MAX_POLL_COUNT
      if (pollingDuration > MAX_POLLING_TIME || newPollCount >= MAX_POLL_COUNT) {
        console.log("Stopping polling after reaching max time or count");
        setPollingActive(false);
        setMaxPollingReached(true);
        return;
      }

      // Use silent polling to avoid console spam
      const isStillGenerating = await fetchGoalDetails(true);
      
      // If content generation is complete (we found the goal and it has tasks)
      if (!isStillGenerating && !notFoundError) {
        console.log("Content generation complete, stopping polling");
        setPollingActive(false);
        fetchTasks();
        toast.success("Goal content has been generated successfully!");
      }
    };
    
    // Set up a stable interval that won't cause UI flickering
    pollingTimerId = window.setInterval(pollForContentGeneration, 1000);
    
    // Clean up interval on unmount or when polling stops
    return () => {
      if (pollingTimerId) {
        window.clearInterval(pollingTimerId);
      }
    };
  }, [
    pollingActive, 
    goalId, 
    fetchGoalDetails, 
    fetchTasks, 
    creationStartTime, 
    notFoundError, 
    pollCount, 
    lastPollTimestamp
  ]);

  const calculateProgress = () => {
    if (!tasks || tasks.length === 0) return 0;
    const completedTasks = tasks.filter(task => task.completed).length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  const handleTaskStatusChange = async (taskId: string, checked: boolean) => {
    await updateTaskStatus(taskId, checked);
  };

  // Show loading state - simplified to be more stable
  if (isLoading && !goalData) {
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

  // Show a message if max polling time reached but goal still not ready
  if (maxPollingReached && !goalData) {
    return (
      <div className="min-h-screen bg-pattern py-6 px-4">
        <div className="max-w-4xl mx-auto glass-card p-6 rounded-2xl">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
          <div className="text-center py-10">
            <p className="text-lg">Your goal is taking longer than expected to create</p>
            <p className="text-sm text-muted-foreground mt-2">
              We're still working on generating your goal content.
            </p>
            <div className="mt-6 space-y-4">
              <Button 
                onClick={() => {
                  setPollingActive(true);
                  setMaxPollingReached(false);
                  setPollCount(0);
                  setCreationStartTime(Date.now());
                  setLastPollTimestamp(Date.now());
                  toast.info("Resuming check for your goal...");
                }}
              >
                Check Again
              </Button>
              <div>
                <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                  Return to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If goal data still not available after all checks
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
            isLoading={false} // No more flickering loader here
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
