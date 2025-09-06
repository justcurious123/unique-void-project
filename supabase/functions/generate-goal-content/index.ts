
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
    const { title, description, goal_id } = await req.json()
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    if (!goal_id) {
      throw new Error('Goal ID is required')
    }

    // Generate tasks with improved ordering instructions
    console.log('Generating tasks for goal:', title, 'with ID:', goal_id)
    const tasksResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: 'system',
            content: 'You are a financial advisor helping to break down financial goals into actionable tasks. Each task should include educational content to help users understand the concepts involved. IMPORTANT: Order the tasks in a logical sequence that follows a chronological timeline and proper learning progression. Tasks that need to be completed first should come first. For example, research tasks and planning should come before implementation tasks. Basic concepts should be introduced before advanced concepts.'
          },
          {
            role: 'user',
            content: `Generate 3-5 tasks for this financial goal:\nTitle: ${title}\nDescription: ${description}\n\nIMPORTANT: Arrange tasks in logical order where preliminary tasks come first and tasks that depend on other tasks come later. For example, in an investment goal, learning about investment options should come before selecting investments, and evaluating performance should come last.`
          }
        ],
        functions: [generateTasksFunction],
        function_call: { name: 'generate_tasks' },
        max_completion_tokens: 2000
      })
    })

    const tasksData = await tasksResponse.json()
    console.log('Tasks response:', JSON.stringify(tasksData, null, 2))
    
    if (!tasksData.choices || !tasksData.choices[0]) {
      throw new Error('Invalid response from OpenAI API for tasks')
    }
    
    let tasks;
    if (tasksData.choices[0].message.function_call?.arguments) {
      tasks = JSON.parse(tasksData.choices[0].message.function_call.arguments).tasks
    } else if (tasksData.choices[0].message.tool_calls?.[0]?.function?.arguments) {
      tasks = JSON.parse(tasksData.choices[0].message.tool_calls[0].function.arguments).tasks
    } else {
      throw new Error('No function call arguments found in tasks response')
    }

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
          model: 'gpt-5-mini-2025-08-07',
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
          function_call: { name: 'generate_quiz' },
          max_completion_tokens: 1000
        })
      })

      const quizData = await quizResponse.json()
      console.log(`Quiz response for task ${index}:`, JSON.stringify(quizData, null, 2))
      
      if (!quizData.choices || !quizData.choices[0]) {
        throw new Error(`Invalid response from OpenAI API for quiz ${index}`)
      }
      
      let quizContent;
      if (quizData.choices[0].message.function_call?.arguments) {
        quizContent = JSON.parse(quizData.choices[0].message.function_call.arguments)
      } else if (quizData.choices[0].message.tool_calls?.[0]?.function?.arguments) {
        quizContent = JSON.parse(quizData.choices[0].message.tool_calls[0].function.arguments)
      } else {
        throw new Error(`No function call arguments found in quiz response ${index}`)
      }
      
      return {
        ...quizContent,
        task_index: index
      }
    }))

    return new Response(
      JSON.stringify({ tasks, quizzes, goal_id }),
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
