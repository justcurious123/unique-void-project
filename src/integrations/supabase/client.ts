// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://wvnsmgzprtbonrlgfyqh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2bnNtZ3pwcnRib25ybGdmeXFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxMjc0OTUsImV4cCI6MjA1NzcwMzQ5NX0.X5vF-zz6qAYMoAu9DYtNuqXxi2OnmiMleBEXcTL_Ju8";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);