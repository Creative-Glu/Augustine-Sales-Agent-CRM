// /types/kpi.ts

// Funnel stage data for each stage in the KPI dashboard
export interface FunnelStage {
  funnel_stage: string;
  leads_reached: number;
  stage_occurrences: number;
  log_events: number;
  avg_hours: number;
}

// CTA metrics (e.g., SAL count, outreached count, conversion %)
export interface CTAMetrics {
  sal_count: number;
  outreached_count: number;
  conversion_rate_pct: number;
}

// Conversion metrics (e.g., won count, conversion %)
export interface ConversionMetrics {
  won_count: number;
  outreached_count: number;
  conversion_rate_pct: number;
}

// Full KPI dashboard API response
export interface KPIDashboardData {
  funnel_stage_data: FunnelStage[];
  cta_clicked: CTAMetrics;
  conversion_rate: ConversionMetrics;
}

// Chart data structure
export interface FunnelChartData {
  stage: string;
  leadsReached: number;
  stageOccurrences: number;
  avgHours: number;
}
