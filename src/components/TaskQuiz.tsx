
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuizzes } from "@/hooks/useQuizzes";
import { Loader2, Award, RotateCcw } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface TaskQuizProps {
  taskId: string;
  onClose: () => void;
}

const TaskQuiz: React.FC<TaskQuizProps> = ({ taskId, onClose }) => {
  const { fetchQuiz } = useQuizzes();
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getQuiz = async () => {
      setLoading(true);
      setError(null);
      try {
        const quizData = await fetchQuiz(taskId);
        
        if (!quizData) {
          setQuiz(null);
          return;
        }
        
        setQuiz(quizData);
        
        // Initialize selectedAnswers array with -1 for each question
        if (quizData.questions && Array.isArray(quizData.questions)) {
          setSelectedAnswers(Array(quizData.questions.length).fill(-1));
        } else {
          // Handle case where questions is not an array
          setError("Invalid quiz data format");
          setQuiz(null);
        }
      } catch (error: any) {
        console.error("Error fetching quiz:", error);
        setError(error.message || "Failed to load quiz");
        toast.error(`Error fetching quiz: ${error.message || "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      getQuiz();
    }
  }, [taskId, fetchQuiz]);

  const handleSelectAnswer = (optionIndex: number) => {
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[currentQuestionIndex] = optionIndex;
    setSelectedAnswers(newSelectedAnswers);
  };

  const handleNextQuestion = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Stop event propagation
    
    if (selectedAnswers[currentQuestionIndex] === -1) {
      toast.error("Please select an answer before continuing");
      return;
    }
    
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate score
      let correctAnswers = 0;
      quiz.questions.forEach((question: any, index: number) => {
        if (selectedAnswers[index] === question.correct_option) {
          correctAnswers++;
        }
      });
      
      const finalScore = Math.round((correctAnswers / quiz.questions.length) * 100);
      setScore(finalScore);
      setQuizCompleted(true);
    }
  };

  const resetQuiz = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedAnswers(Array(quiz?.questions.length || 0).fill(-1));
    setCurrentQuestionIndex(0);
    setQuizCompleted(false);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Quiz Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
          <Button onClick={handleClose} className="mt-4">Close</Button>
        </CardContent>
      </Card>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No Quiz Available</CardTitle>
        </CardHeader>
        <CardContent>
          <p>There are no quiz questions for this task.</p>
          <Button onClick={handleClose} className="mt-4">Close</Button>
        </CardContent>
      </Card>
    );
  }

  if (quizCompleted) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Quiz Completed!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4">
            <div className="text-4xl font-bold mb-2">{score}%</div>
            <p className="text-muted-foreground">
              You got {quiz.questions.filter((_: any, index: number) => 
                selectedAnswers[index] === quiz.questions[index].correct_option
              ).length} out of {quiz.questions.length} questions correct
            </p>
          </div>
          
          <div className="flex gap-3 justify-center">
            <Button onClick={resetQuiz} variant="outline" className="flex items-center gap-1">
              <RotateCcw className="h-4 w-4" />
              Try Again
            </Button>
            <Button onClick={handleClose}>
              Close Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{quiz.title}</CardTitle>
        <div className="text-sm text-muted-foreground mt-1">
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="font-medium text-lg">{currentQuestion.question}</div>
        
        <RadioGroup 
          value={selectedAnswers[currentQuestionIndex].toString()} 
          onValueChange={(value) => handleSelectAnswer(parseInt(value))}
        >
          {currentQuestion.options.map((option: string, index: number) => (
            <div key={index} className="flex items-start space-x-2 my-2">
              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`} className="font-normal cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
        
        <div className="flex justify-between pt-4">
          <Button 
            variant="outline" 
            onClick={handleClose}
            type="button"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleNextQuestion}
            type="button"
          >
            {currentQuestionIndex === quiz.questions.length - 1 ? 'Finish' : 'Next Question'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskQuiz;
