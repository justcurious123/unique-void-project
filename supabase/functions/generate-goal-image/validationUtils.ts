
// Validate API keys and environment
export function validateEnvironment() {
  const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  
  if (!REPLICATE_API_KEY) {
    throw new Error('REPLICATE_API_KEY is not set');
  }
  
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  return {
    REPLICATE_API_KEY,
    OPENAI_API_KEY
  };
}

// Validate request data
export function validateRequestData(data: any) {
  const { goalTitle, goalId } = data;

  if (!goalTitle || !goalId) {
    throw new Error("Missing required fields: goalTitle and goalId are required");
  }

  return { goalTitle, goalId };
}
