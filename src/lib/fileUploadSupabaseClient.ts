import { createClient, SupabaseClient } from '@supabase/supabase-js';

const fileUploadSupabaseUrl = process.env.NEXT_PUBLIC_FILE_UPLOAD_SUPABASE_URL!;
const fileUploadSupabaseAnonKey = process.env.NEXT_PUBLIC_FILE_UPLOAD_SUPABASE_ANON_KEY!;

function validateFileUploadSupabaseConfig(): void {
  if (!fileUploadSupabaseUrl) {
    throw new Error(
      'Missing NEXT_PUBLIC_FILE_UPLOAD_SUPABASE_URL environment variable. ' +
        'Please add it to your .env.local file.'
    );
  }

  if (!fileUploadSupabaseAnonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_FILE_UPLOAD_SUPABASE_ANON_KEY environment variable. ' +
        'Please add it to your .env.local file.'
    );
  }

  // Validate URL format
  try {
    new URL(fileUploadSupabaseUrl);
  } catch {
    throw new Error(
      `Invalid NEXT_PUBLIC_FILE_UPLOAD_SUPABASE_URL format: ${fileUploadSupabaseUrl}. ` +
        `Please ensure it's a valid URL.`
    );
  }
}

// Validate configuration on module load
validateFileUploadSupabaseConfig();

export const fileUploadSupabase: SupabaseClient = createClient(
  fileUploadSupabaseUrl,
  fileUploadSupabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
