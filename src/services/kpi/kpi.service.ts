import { supabase } from '@/lib/supabaseClient';

// 1. Conversion Rate
export const getConversionRate = async (campaign_id?: number) => {
  try {
    const { data, error } = await supabase.rpc('conversion_rate_sql', { campaign_id });
    if (error) throw new Error(`Error fetching conversion rate: ${error.message}`);
    return data;
  } catch (error) {
    throw error instanceof Error ? error : new Error('getConversionRate failed');
  }
};

// 2. CTA Clicked
export const getCTAClicked = async (campaign_id?: number, sal_campaign_id?: number) => {
  try {
    const { data, error } = await supabase.rpc('cta_clicked_sql', { campaign_id, sal_campaign_id });
    if (error) throw new Error(`Error fetching CTA data: ${error.message}`);
    return data;
  } catch (error) {
    throw error instanceof Error ? error : new Error('getCTAClicked failed');
  }
};

// 3. Avg Hours Per Funnel Stage
export const getFunnelStageAnalytics = async (
  campaign_id?: number,
  start_ts?: string,
  end_ts?: string
) => {
  try {
    const { data, error } = await supabase.rpc('avg_hours_per_stage_sql', {
      campaign_id,
      start_ts,
      end_ts,
    });
    if (error) throw new Error(`Error fetching funnel analytics: ${error.message}`);
    return data;
  } catch (error) {
    throw error instanceof Error ? error : new Error('getFunnelStageAnalytics failed');
  }
};

export const fetchKPIData = async () => {
  try {
    const { data, error } = await supabase.rpc('kpi_dashboard_metrics');
    if (error) throw new Error(`Error fetching KPI data: ${error.message}`);
    return data ?? [];
  } catch (error) {
    throw error instanceof Error ? error : new Error('fetchKPIData failed');
  }
};
