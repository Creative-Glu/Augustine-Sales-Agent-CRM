import { supabase } from '@/lib/supabaseClient';

export async function getDashboardAnalytics() {
  try {
    const [products, journeys, icps, campaigns] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('journeys').select('*', { count: 'exact', head: true }),
      supabase.from('icps').select('*', { count: 'exact', head: true }),
      supabase.from('campaigns').select('*', { count: 'exact', head: true }),
    ]);

    if (products.error) throw products.error;
    if (journeys.error) throw journeys.error;
    if (icps.error) throw icps.error;
    if (campaigns.error) throw campaigns.error;

    return {
      products: products.count ?? 0,
      journeys: journeys.count ?? 0,
      icps: icps.count ?? 0,
      campaigns: campaigns.count ?? 0,
    };
  } catch (error) {
    throw error;
  }
}
