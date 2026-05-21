import { supabase } from '@/lib/supabaseClient';
import { JourneyLog } from '@/types/log';

export async function getLogsForJourney(journeyId: string): Promise<JourneyLog[]> {
  try {
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .eq('journey_id', journeyId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Error fetching journey logs: ${error.message}`);
    return (data ?? []) as JourneyLog[];
  } catch (error) {
    throw error instanceof Error ? error : new Error('getLogsForJourney failed');
  }
}
