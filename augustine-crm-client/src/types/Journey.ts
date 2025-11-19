export interface Journey {
  journey_id: string;
  lead_id: number;
  campaign_id: number;
  funnel_stage: string;
  last_interaction: string;
  notes: string;
  created_at: string;
  updated_at: string;
  campaigns: {
    campaign_name: string;
    campaign_status: string;
    instructions: string;
  };
  campaign_test_group: {
    'Parish Name': string;
    'Parish Phone': string;
    'Parish Contact Email': string;
    'Formed Status': string;
  };
}
