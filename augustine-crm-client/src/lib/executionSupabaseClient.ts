import { createClient, SupabaseClient } from '@supabase/supabase-js';

const executionDbUrl = process.env.NEXT_PUBLIC_EXECUTION_DB_URL!;
const executionDbAnonKey = process.env.NEXT_PUBLIC_EXECUTION_DB_ANON_KEY!;

function validateExecutionDbConfig(): void {
  if (!executionDbUrl) {
    throw new Error(
      'Missing NEXT_PUBLIC_EXECUTION_DB_URL environment variable. ' +
        'Please add it to your .env.local file.'
    );
  }

  if (!executionDbAnonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_EXECUTION_DB_ANON_KEY environment variable. ' +
        'Please add it to your .env.local file.'
    );
  }

  try {
    new URL(executionDbUrl);
  } catch {
    throw new Error(
      `Invalid NEXT_PUBLIC_EXECUTION_DB_URL format: ${executionDbUrl}. ` +
        `Please ensure it's a valid URL.`
    );
  }
}

validateExecutionDbConfig();

export const executionSupabase: SupabaseClient = createClient(
  executionDbUrl,
  executionDbAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
