import { supabase } from '@/lib/supabaseClient';
import { Journey } from '@/types/Journey';

export async function getJourneys(): Promise<Journey[]> {
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
    console.error('Error fetching journeys:', error.message);
    return []; // return empty array on error
  }

  return Array.isArray(data) ? data : [];
}
