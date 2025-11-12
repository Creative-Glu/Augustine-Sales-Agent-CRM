import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Validates that required Supabase environment variables are present
 * @throws {Error} If required environment variables are missing
 */
function validateSupabaseConfig(): void {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL environment variable. ' +
        'Please add it to your .env.local file.'
    );
  }

  if (!supabaseAnonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. ' +
        'Please add it to your .env.local file.'
    );
  }

  // Validate URL format
  try {
    new URL(supabaseUrl);
  } catch {
    throw new Error(
      `Invalid NEXT_PUBLIC_SUPABASE_URL format: ${supabaseUrl}. ` +
        `Please ensure it's a valid URL.`
    );
  }
}

// Validate configuration on module load
validateSupabaseConfig();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Supabase client instance
 * Configured with URL and anonymous key from environment variables
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Validates the Supabase connection by performing a test query
 * Uses the auth API which is always available
 * @returns {Promise<boolean>} True if connection is valid, false otherwise
 */
export async function validateSupabaseConnection(): Promise<boolean> {
  try {
    // Use auth API to test connection - this is always available
    const { error } = await supabase.auth.getSession();

    // If we get here without a critical error, connection is valid
    // Auth errors are acceptable for connection validation
    return !error || error.message.includes('session');
  } catch (error) {
    console.error('Supabase connection validation failed:', error);
    return false;
  }
}

/**
 * Health check function that validates both config and connection
 * @returns {Promise<{ valid: boolean; error?: string }>}
 */
export async function checkSupabaseHealth(): Promise<{ valid: boolean; error?: string }> {
  try {
    // Validate configuration
    validateSupabaseConfig();

    // Test connection with a simple query
    const { error } = await supabase.auth.getSession();

    if (error) {
      return {
        valid: false,
        error: `Connection error: ${error.message}`,
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
