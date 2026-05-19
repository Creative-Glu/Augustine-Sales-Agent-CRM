export interface JourneyLead {
  id: number;
  icps?: string[] | null;
  icp_id?: string | null;
  'Parish Name'?: string | null;
  'Email Thread'?: string | null;
  'Parish Phone'?: string | null;
  'Formed Status'?: string | null;
  Classification?: string | null;
  'Institution Type'?: string | null;
  'Deanery/Vicariate'?: string | null;
  'Budget Cycle Month'?: string | null;
  'Parish Contact Email'?: string | null;
  'Technology Readiness'?: string | null;
  'Rite/Church Sui Juris'?: string | null;
  'Liturgical Language(s)'?: string | null;
  'Ecclesiastical Province'?: string | null;
  'Diocese/Archdiocese Name'?: string | null;
  'Religious Order Affiliation'?: string | null;
  'Parish Size/School Enrollmen'?: string | null;
}

export interface JourneyCampaign {
  campaign_id: number;
  campaign_name: string;
  campaign_status: string;
  instructions?: string;
  offer_id?: string;
  createdat?: string;
}

export interface Journey {
  journey_id: string;
  lead_id: number;
  campaign_id: number;
  funnel_stage: string;
  last_interaction: string;
  email_thread_id?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  campaigns: JourneyCampaign | null;
  lead: JourneyLead | null;
}
