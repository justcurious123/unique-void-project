
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Flag, 
  Check, 
  Plus, 
  ListChecks, 
  ChevronDown, 
  Book, 
  Award,
  Pencil,
  Trash2,
  CheckCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";

// Types
interface Goal {
  id: string;
  title: string;
  description: string;
  target_date: string;
  created_at: string;
  user_id: string;
  completed: boolean;
}

interface Task {
  id: string;
  goal_id: string;
  title: string;
  description: string;
  order_number: number;
  completed: boolean;
  article_content: string;
}

interface Quiz {
  id: string;
  task_id: string;
  title: string;
  questions: QuizQuestion[];
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_option: number;
}

const GoalsPage: React.FC = () => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newGoal, setNewGoal] = useState({ title: "", description: "", target_date: "" });
  const [newTask, setNewTask] = useState({ title: "", description: "", article_content: "" });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const [openGoalDialog, setOpenGoalDialog] = useState(false);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [openTaskSheet, setOpenTaskSheet] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [openQuizDialog, setOpenQuizDialog] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      
      if (!data.session) {
        toast.error("Please log in to view and manage your financial goals");
        navigate("/auth");
      } else {
        fetchGoals();
      }
    };
    
    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      setIsAuthenticated(event === 'SIGNED_IN');
      
      if (event === 'SIGNED_OUT') {
        navigate("/auth");
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  // Fetch goals for authenticated user
  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setGoals(data || []);
    } catch (error: any) {
      toast.error(`Error fetching goals: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch tasks for a specific goal
  const fetchTasks = async (goalId: string) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('goal_id', goalId)
        .order('order_number', { ascending: true });
        
      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      toast.error(`Error fetching tasks: ${error.message}`);
    }
  };

  // Handle goal expansion/collapse
  const toggleGoalExpand = (goalId: string) => {
    if (expandedGoalId === goalId) {
      setExpandedGoalId(null);
    } else {
      setExpandedGoalId(goalId);
      const goal = goals.find(g => g.id === goalId) || null;
      setSelectedGoal(goal);
      if (goal) fetchTasks(goalId);
    }
  };

  // Create a new goal
  const handleCreateGoal = async () => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .insert([
          { 
            title: newGoal.title, 
            description: newGoal.description,
            target_date: newGoal.target_date,
            completed: false
          }
        ])
        .select();
        
      if (error) throw error;
      
      setGoals([...(data || []), ...goals]);
      setNewGoal({ title: "", description: "", target_date: "" });
      setOpenGoalDialog(false);
      toast.success("Financial goal created successfully!");
      fetchGoals();
    } catch (error: any) {
      toast.error(`Error creating goal: ${error.message}`);
    }
  };

  // Create a new task for a goal
  const handleCreateTask = async () => {
    if (!selectedGoal) return;
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          { 
            goal_id: selectedGoal.id,
            title: newTask.title, 
            description: newTask.description,
            article_content: newTask.article_content,
            order_number: tasks.length, 
            completed: false
          }
        ])
        .select();
        
      if (error) throw error;
      
      if (data) {
        setTasks([...tasks, ...data]);
        setNewTask({ title: "", description: "", article_content: "" });
        setOpenTaskDialog(false);
        toast.success("Task added to goal successfully!");
        fetchTasks(selectedGoal.id);
      }
    } catch (error: any) {
      toast.error(`Error creating task: ${error.message}`);
    }
  };

  // Open task details sheet
  const openTaskDetails = (task: Task) => {
    setSelectedTask(task);
    setOpenTaskSheet(true);
  };

  // Fetch quiz for a task
  const fetchQuiz = async (taskId: string) => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('task_id', taskId)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          // No quiz found
          return null;
        }
        throw error;
      }
      
      if (data) {
        // Initialize answers array with -1 (not answered)
        setQuizAnswers(Array(data.questions.length).fill(-1));
        return data as Quiz;
      }
      
      return null;
    } catch (error: any) {
      toast.error(`Error fetching quiz: ${error.message}`);
      return null;
    }
  };

  // Start quiz for a task
  const startQuiz = async (taskId: string) => {
    const quiz = await fetchQuiz(taskId);
    if (quiz) {
      setActiveQuiz(quiz);
      setQuizScore(null);
      setOpenQuizDialog(true);
    } else {
      toast.error("No quiz available for this task");
    }
  };

  // Handle quiz answer selection
  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = optionIndex;
    setQuizAnswers(newAnswers);
  };

  // Submit quiz answers
  const submitQuiz = async () => {
    if (!activeQuiz || !selectedTask) return;
    
    // Calculate score
    let correctCount = 0;
    activeQuiz.questions.forEach((question, index) => {
      if (quizAnswers[index] === question.correct_option) {
        correctCount++;
      }
    });
    
    const score = (correctCount / activeQuiz.questions.length) * 100;
    setQuizScore(score);
    
    // Mark task as completed if score is 70% or higher
    if (score >= 70) {
      try {
        const { error } = await supabase
          .from('tasks')
          .update({ completed: true })
          .eq('id', selectedTask.id);
          
        if (error) throw error;
        
        // Update tasks state
        setTasks(tasks.map(t => 
          t.id === selectedTask.id ? { ...t, completed: true } : t
        ));
        
        toast.success("Congratulations! You've completed this task.");
        
        // Check if all tasks for the goal are completed
        const updatedTasks = tasks.map(t => 
          t.id === selectedTask.id ? { ...t, completed: true } : t
        );
        
        const allTasksCompleted = updatedTasks.every(t => t.completed);
        
        if (allTasksCompleted && selectedGoal) {
          // Mark goal as completed
          await supabase
            .from('goals')
            .update({ completed: true })
            .eq('id', selectedGoal.id);
            
          // Update goals state
          setGoals(goals.map(g => 
            g.id === selectedGoal.id ? { ...g, completed: true } : g
          ));
          
          toast.success("🎉 Congratulations! You've achieved your financial goal!");
        }
      } catch (error: any) {
        toast.error(`Error updating task status: ${error.message}`);
      }
    } else {
      toast.error("You need to score at least 70% to complete the task. Please try again.");
    }
  };

  // Calculate goal progress
  const calculateGoalProgress = (goalId: string) => {
    const goalTasks = tasks.filter(task => task.goal_id === goalId);
    if (goalTasks.length === 0) return 0;
    
    const completedTasks = goalTasks.filter(task => task.completed).length;
    return Math.round((completedTasks / goalTasks.length) * 100);
  };

  // Delete a goal
  const deleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);
        
      if (error) throw error;
      
      setGoals(goals.filter(g => g.id !== goalId));
      toast.success("Goal deleted successfully");
    } catch (error: any) {
      toast.error(`Error deleting goal: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto py-20 px-4 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Flag className="h-8 w-8" />
          Financial Goals
        </h1>
        
        <Dialog open={openGoalDialog} onOpenChange={setOpenGoalDialog}>
          <DialogTrigger asChild>
            <Button className="gap-1">
              <Plus size={18} />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Financial Goal</DialogTitle>
              <DialogDescription>
                Define a financial goal you want to achieve. You can add tasks to break it down into actionable steps.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="title" className="text-sm font-medium">Goal Title</label>
                <Input
                  id="title"
                  placeholder="e.g., Save for retirement"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <Input
                  id="description"
                  placeholder="Briefly describe your goal"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="target_date" className="text-sm font-medium">Target Date</label>
                <Input
                  id="target_date"
                  type="date"
                  value={newGoal.target_date}
                  onChange={(e) => setNewGoal({...newGoal, target_date: e.target.value})}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="submit" onClick={handleCreateGoal}>Create Goal</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : goals.length === 0 ? (
        <Card className="mb-8 border-dashed">
          <CardContent className="pt-6 flex flex-col items-center text-center p-12">
            <Flag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No Financial Goals Yet</h3>
            <p className="text-muted-foreground mb-6">
              Start by creating your first financial goal. Break it down into tasks and track your progress.
            </p>
            <Button onClick={() => setOpenGoalDialog(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {goals.map((goal) => (
            <Card key={goal.id} className={goal.completed ? "border-green-200 bg-green-50/30" : ""}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {goal.completed && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {goal.title}
                    </CardTitle>
                    <CardDescription className="mt-1.5">{goal.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => deleteGoal(goal.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => toggleGoalExpand(goal.id)}
                      aria-expanded={expandedGoalId === goal.id}
                    >
                      <ChevronDown 
                        className={`h-4 w-4 transition-transform ${expandedGoalId === goal.id ? 'rotate-180' : ''}`} 
                      />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm">
                    {expandedGoalId === goal.id ? `${calculateGoalProgress(goal.id)}%` : ''}
                  </span>
                </div>
                <Progress value={calculateGoalProgress(goal.id)} className="h-2" />
              </CardContent>
              
              {expandedGoalId === goal.id && (
                <>
                  <CardContent className="pt-2">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <ListChecks className="h-5 w-5" />
                        Tasks
                      </h3>
                      
                      <Dialog open={openTaskDialog} onOpenChange={setOpenTaskDialog}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Add Task
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add a New Task</DialogTitle>
                            <DialogDescription>
                              Break down your goal into smaller, actionable tasks.
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <label htmlFor="task-title" className="text-sm font-medium">Task Title</label>
                              <Input
                                id="task-title"
                                placeholder="e.g., Research retirement account options"
                                value={newTask.title}
                                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                              />
                            </div>
                            
                            <div className="grid gap-2">
                              <label htmlFor="task-description" className="text-sm font-medium">Instructions</label>
                              <Input
                                id="task-description"
                                placeholder="Step-by-step instructions"
                                value={newTask.description}
                                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                              />
                            </div>
                            
                            <div className="grid gap-2">
                              <label htmlFor="article-content" className="text-sm font-medium">Educational Content</label>
                              <Input
                                id="article-content"
                                placeholder="Information to help complete this task"
                                value={newTask.article_content}
                                onChange={(e) => setNewTask({...newTask, article_content: e.target.value})}
                              />
                            </div>
                          </div>
                          
                          <DialogFooter>
                            <Button type="submit" onClick={handleCreateTask}>Add Task</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    {tasks.length === 0 ? (
                      <div className="text-center p-6 bg-muted/20 rounded-lg">
                        <p className="text-muted-foreground">No tasks yet. Add tasks to break down your goal.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {tasks.map((task, index) => (
                          <Card key={task.id} className={`relative ${task.completed ? 'bg-green-50/30 border-green-200' : ''}`}>
                            <CardContent className="p-4 flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-white ${task.completed ? 'bg-green-500' : 'bg-primary'}`}>
                                  {task.completed ? (
                                    <Check className="h-5 w-5" />
                                  ) : (
                                    <span className="text-sm font-medium">{index + 1}</span>
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-medium">{task.title}</h4>
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => openTaskDetails(task)}
                                >
                                  <Book className="h-4 w-4 mr-1" />
                                  Details
                                </Button>
                                
                                {!task.completed && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => startQuiz(task.id)}
                                  >
                                    <Award className="h-4 w-4 mr-1" />
                                    Quiz
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
      
      {/* Task Details Sheet */}
      <Sheet open={openTaskSheet} onOpenChange={setOpenTaskSheet}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{selectedTask?.title}</SheetTitle>
            <SheetDescription>
              {selectedTask?.completed ? (
                <span className="inline-flex items-center text-green-600 font-medium">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Completed
                </span>
              ) : "In progress"}
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Instructions</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {selectedTask?.description}
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                <Book className="h-5 w-5" />
                Educational Content
              </h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {selectedTask?.article_content}
                </p>
              </div>
            </div>
            
            {!selectedTask?.completed && (
              <Button 
                className="w-full mt-4" 
                onClick={() => {
                  if (selectedTask) {
                    setOpenTaskSheet(false);
                    startQuiz(selectedTask.id);
                  }
                }}
              >
                <Award className="h-4 w-4 mr-2" />
                Take the Quiz
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Quiz Dialog */}
      <Dialog open={openQuizDialog} onOpenChange={setOpenQuizDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              {activeQuiz?.title || "Task Quiz"}
            </DialogTitle>
            <DialogDescription>
              Answer the following questions to complete this task. You need at least 70% to pass.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 max-h-[60vh] overflow-y-auto">
            {quizScore !== null ? (
              <div className="space-y-4 text-center py-4">
                <div className={`text-3xl font-bold ${quizScore >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.round(quizScore)}%
                </div>
                <p className="text-lg">
                  {quizScore >= 70 
                    ? "Congratulations! You've passed the quiz." 
                    : "You didn't pass. Please try again."}
                </p>
                <Button 
                  variant={quizScore >= 70 ? "default" : "outline"} 
                  onClick={() => setOpenQuizDialog(false)}
                >
                  {quizScore >= 70 ? "Continue" : "Close"}
                </Button>
              </div>
            ) : (
              <>
                {activeQuiz?.questions.map((question, qIndex) => (
                  <div key={qIndex} className="mb-8 last:mb-0">
                    <h3 className="text-base font-medium mb-3">
                      {qIndex + 1}. {question.question}
                    </h3>
                    <div className="space-y-2">
                      {question.options.map((option, oIndex) => (
                        <div 
                          key={oIndex}
                          className={`p-3 border rounded-md cursor-pointer transition-colors ${
                            quizAnswers[qIndex] === oIndex 
                              ? 'bg-primary/10 border-primary' 
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => handleAnswerSelect(qIndex, oIndex)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                              quizAnswers[qIndex] === oIndex 
                                ? 'bg-primary text-primary-foreground' 
                                : 'border border-input'
                            }`}>
                              {quizAnswers[qIndex] === oIndex && <Check className="h-3 w-3" />}
                            </div>
                            <span>{option}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                <DialogFooter className="mt-6">
                  <Button 
                    onClick={submitQuiz}
                    disabled={quizAnswers.some(a => a === -1)}
                  >
                    Submit Answers
                  </Button>
                </DialogFooter>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GoalsPage;
