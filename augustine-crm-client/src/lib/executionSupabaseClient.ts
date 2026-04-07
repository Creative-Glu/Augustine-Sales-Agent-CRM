import { createClient, SupabaseClient } from '@supabase/supabase-js';

const executionDbUrl = process.env.NEXT_PUBLIC_EXECUTION_DB_URL ?? '';
const executionDbAnonKey = process.env.NEXT_PUBLIC_EXECUTION_DB_ANON_KEY ?? '';

function createExecutionClient(): SupabaseClient {
  if (!executionDbUrl || !executionDbAnonKey) {
    // Return a dummy client that will fail gracefully on actual queries
    // rather than crashing the entire app at module load time.
    // This allows pages that don't use execution DB (login, dashboard) to still work.
    return createClient('https://placeholder.supabase.co', 'placeholder-key', {
      auth: { persistSession: false },
    });
  }

  return createClient(executionDbUrl, executionDbAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export const executionSupabase: SupabaseClient = createExecutionClient();
