import { supabase } from '@/lib/supabaseClient';
import { Journey } from '@/types/Journey';

export async function getJourneys(): Promise<Journey[]> {
  try {
    const { data, error } = await supabase
      .from('journeys')
      .select(
        `
      *,
      campaigns(*),
      campaign_test_group(*)
    `
      )
      .order('created_at', { ascending: false });

    if (error) {
      return []; // return empty array on error
    }

    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw error instanceof Error ? error : new Error('getJourneys failed');
  }
}
