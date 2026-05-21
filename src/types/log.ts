export interface JourneyLog {
  log_id: string;
  journey_id: string;
  lead_id: number;
  funnel_stage: string;
  notes: string | null;
  created_at: string;
  idx: number;
}
