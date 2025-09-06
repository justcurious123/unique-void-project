
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { tasks } = await req.json()
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    if (!tasks || tasks.length === 0) {
      return new Response(
        JSON.stringify({ summary: "No tasks available for this goal." }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Generating summary for tasks:', tasks.map(t => t.title).join(', '))
    
    const taskData = tasks.map(t => ({
      title: t.title,
      description: t.description,
      article_content: t.article_content
    }))

    // Generate summary using the latest model
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are a financial assistant creating a concise summary of tasks for a financial goal. Keep your summary under 200 characters without listing individual tasks.'
          },
          {
            role: 'user',
            content: `Here are the tasks for a financial goal:\n${JSON.stringify(taskData, null, 2)}\n\nCreate a brief summary that captures the essence of these tasks without listing them individually.`
          }
        ],
        max_completion_tokens: 100
      })
    })

    const data = await response.json()
    
    if (!data.choices || !data.choices[0]) {
      throw new Error('Invalid response from OpenAI API')
    }
    
    const summary = data.choices[0].message.content.trim()
    console.log('Generated summary:', summary);

    return new Response(
      JSON.stringify({ summary }),
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
