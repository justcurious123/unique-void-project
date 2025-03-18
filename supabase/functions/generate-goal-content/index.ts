
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const generateTasksFunction = {
  name: "generate_tasks",
  description: "Generate a list of tasks for a financial goal",
  parameters: {
    type: "object",
    properties: {
      tasks: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string", description: "Short, actionable task title" },
            description: { type: "string", description: "Detailed explanation of the task" },
            article_content: { type: "string", description: "Educational content explaining concepts related to this task" }
          },
          required: ["title", "description", "article_content"]
        }
      }
    },
    required: ["tasks"]
  }
};

const generateQuizFunction = {
  name: "generate_quiz",
  description: "Generate quiz questions based on task content",
  parameters: {
    type: "object",
    properties: {
      title: { type: "string", description: "Title of the quiz" },
      questions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            question: { type: "string", description: "Quiz question" },
            options: { 
              type: "array", 
              items: { type: "string" },
              description: "Array of possible answers"
            },
            correct_option: { 
              type: "integer",
              description: "Index of the correct answer in the options array (0-based)"
            }
          },
          required: ["question", "options", "correct_option"]
        }
      }
    },
    required: ["title", "questions"]
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { title, description } = await req.json()
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Generate tasks
    console.log('Generating tasks for goal:', title)
    const tasksResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a financial advisor helping to break down financial goals into actionable tasks. Each task should include educational content to help users understand the concepts involved.'
          },
          {
            role: 'user',
            content: `Generate 3-5 tasks for this financial goal:\nTitle: ${title}\nDescription: ${description}`
          }
        ],
        functions: [generateTasksFunction],
        function_call: { name: 'generate_tasks' }
      })
    })

    const tasksData = await tasksResponse.json()
    const tasks = JSON.parse(tasksData.choices[0].message.function_call.arguments).tasks

    // Generate quiz for each task
    console.log('Generating quizzes for tasks')
    const quizzes = await Promise.all(tasks.map(async (task, index) => {
      const quizResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are creating an educational quiz based on financial concepts. Generate questions that test understanding of key concepts.'
            },
            {
              role: 'user',
              content: `Create a quiz with 3 questions based on this content:\n${task.article_content}`
            }
          ],
          functions: [generateQuizFunction],
          function_call: { name: 'generate_quiz' }
        })
      })

      const quizData = await quizResponse.json()
      return {
        ...JSON.parse(quizData.choices[0].message.function_call.arguments),
        task_index: index
      }
    }))

    return new Response(
      JSON.stringify({ tasks, quizzes }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
