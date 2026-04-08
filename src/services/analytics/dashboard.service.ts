import { supabase } from '@/lib/supabaseClient';

export async function getDashboardAnalytics() {
  try {
    const [products, journeys, icps, campaigns] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('journeys').select('*', { count: 'exact', head: true }),
      supabase.from('icps').select('*', { count: 'exact', head: true }),
      supabase.from('campaigns').select('*', { count: 'exact', head: true }),
    ]);

    if (products.error) throw new Error(`Error fetching products count: ${products.error.message}`);
    if (journeys.error) throw new Error(`Error fetching journeys count: ${journeys.error.message}`);
    if (icps.error) throw new Error(`Error fetching ICPs count: ${icps.error.message}`);
    if (campaigns.error) throw new Error(`Error fetching campaigns count: ${campaigns.error.message}`);

    return {
      products: products.count ?? 0,
      journeys: journeys.count ?? 0,
      icps: icps.count ?? 0,
      campaigns: campaigns.count ?? 0,
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error('getDashboardAnalytics failed');
  }
}
