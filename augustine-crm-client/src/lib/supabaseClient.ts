import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

function createMainClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a dummy client so the app doesn't crash at module load.
    // Pages that don't need Supabase (login, error pages) will still render.
    return createClient('https://placeholder.supabase.co', 'placeholder-key', {
      auth: { persistSession: false },
    });
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export const supabase: SupabaseClient = createMainClient();

export async function validateSupabaseConnection(): Promise<boolean> {
  if (!supabaseUrl || !supabaseAnonKey) return false;
  try {
    const { error } = await supabase.auth.getSession();
    return !error || error.message.includes('session');
  } catch {
    return false;
  }
}

export async function checkSupabaseHealth(): Promise<{ valid: boolean; error?: string }> {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { valid: false, error: 'Supabase environment variables not configured.' };
  }
  try {
    const { error } = await supabase.auth.getSession();
    if (error) return { valid: false, error: `Connection error: ${error.message}` };
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
