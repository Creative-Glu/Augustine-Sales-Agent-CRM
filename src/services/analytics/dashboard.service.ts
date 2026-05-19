import { supabase } from '@/lib/supabaseClient';
import { STAGE_ORDER } from '@/constants/journey';

export interface DashboardAnalytics {
  products: number;
  journeys: number;
  icps: number;
  campaigns: number;
  stageCounts: Record<string, number>;
}

export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  try {
    const stageCountPromises = STAGE_ORDER.map((stage) =>
      supabase
        .from('journeys')
        .select('*', { count: 'exact', head: true })
        .eq('funnel_stage', stage)
        .then((res) => ({ stage, count: res.count ?? 0, error: res.error }))
    );

    const [products, journeys, icps, campaigns, ...stageResults] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('journeys').select('*', { count: 'exact', head: true }),
      supabase.from('icps').select('*', { count: 'exact', head: true }),
      supabase.from('campaigns').select('*', { count: 'exact', head: true }),
      ...stageCountPromises,
    ]);

    if (products.error) throw new Error(`Error fetching products count: ${products.error.message}`);
    if (journeys.error) throw new Error(`Error fetching journeys count: ${journeys.error.message}`);
    if (icps.error) throw new Error(`Error fetching ICPs count: ${icps.error.message}`);
    if (campaigns.error)
      throw new Error(`Error fetching campaigns count: ${campaigns.error.message}`);

    const stageCounts: Record<string, number> = {};
    for (const result of stageResults) {
      if (result.error) {
        throw new Error(
          `Error fetching journey count for stage "${result.stage}": ${result.error.message}`
        );
      }
      stageCounts[result.stage] = result.count;
    }

    return {
      products: products.count ?? 0,
      journeys: journeys.count ?? 0,
      icps: icps.count ?? 0,
      campaigns: campaigns.count ?? 0,
      stageCounts,
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error('getDashboardAnalytics failed');
  }
}
