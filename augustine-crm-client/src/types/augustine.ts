import type { ApiRole } from '@/lib/augustineApiClient';

export type { ApiRole };

// ---------- Metrics ----------

export interface MetricsOverview {
  total_contacts: number;
  enriched_contacts: number;
  hubspot_synced: number;
  failed_sync: number;
  retry_queue_size: number;
  enrichment_confidence_distribution: Record<string, number>;
  outreach_generated: number;
  outreach_approved: number;
  total_icps: number;
  total_campaigns: number;
  active_campaigns: number;
  outreach_generated_by_campaign: Record<string | number, number>;
  outreach_sent_by_campaign: Record<string | number, number>;
}

export interface MetricsSystem {
  error_rates: {
    hubspot_failure_rate: number;
    enrichment_failure_rate: number;
    [key: string]: number;
  };
  retry_queue_size: number;
  rate_limits?: Record<string, unknown>;
  cost: {
    daily_tokens_used: number;
    daily_ai_token_cap: number;
    monthly_enrichments: number;
    monthly_enrichment_cap: number;
  };
  alerts: Array<{
    type: string;
    value: number;
    threshold: number;
  }>;
}

export interface MetricsRoi {
  totals: {
    total_contacts: number;
    enriched_contacts: number;
    hubspot_synced_contacts: number;
    outreach_generated: number;
    outreach_sent: number;
  };
  recent: {
    days: number;
    contacts_synced: number;
    outreach_sent: number;
    estimated_hours_saved: number;
    estimated_fte_equivalent: number;
  };
  flow: {
    avg_hours_new_contact_to_crm_ready: number | null;
  };
  roi_estimates: {
    total_hours_saved: number;
    fte_equivalent: number;
  };
  assumptions: {
    manual_minutes_per_contact: number;
    manual_minutes_per_outreach: number;
    fte_hours_per_week: number;
    recent_days: number;
  };
}

// ---------- Jobs ----------

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface JobSummary {
  total_websites?: number;
  successfully_processed?: number;
  failed?: number;
  [key: string]: unknown;
}

export interface JobDetail {
  job_id: string;
  status: JobStatus;
  urls: string[];
  submitted_at: string;
  started_at: string | null;
  completed_at: string | null;
  summary: JobSummary | null;
  error: string | null;
  token_usage?: Record<string, unknown> | null;
}

export interface JobsListItem {
  job_id: string;
  status: JobStatus;
  urls_count: number;
  submitted_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface JobsListResponse {
  total_jobs: number;
  jobs: JobsListItem[];
}

export interface JobSubmitResponse {
  job_id: string;
  status: JobStatus;
  urls: string[];
  message?: string;
  submitted_at: string;
}

export interface JobResultItem {
  url: string;
  source: string;
  status: 'Success' | 'Failed';
  processed_at: string | null;
  institutions: Array<Record<string, unknown>>;
  staff: Array<{
    name: string;
    role: string | null;
    email: string | null;
    contact: string | null;
    contact_number: string | null;
  }>;
}

export interface JobResultsResponse {
  job_id: string;
  status: JobStatus;
  results: JobResultItem[];
  summary: JobSummary;
}

// ---------- ICP ----------

export interface IcpFilters {
  institution_type?: string | null;
  staff_role_contains?: string | null;
  min_confidence_score?: number | null;
  enrichment_status?: string | null;
  [key: string]: unknown;
}

export interface Icp {
  id: number | string;
  name: string;
  description?: string | null;
  filters: IcpFilters;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// ---------- Campaigns ----------

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';

export interface Campaign {
  id: number;
  icp_id: number | string | null;
  name: string;
  template_subject: string;
  template_body: string;
  tone?: string | null;
  status: CampaignStatus;
  daily_send_limit?: number | null;
  auto_mode?: boolean | null;
  created_at?: string;
  updated_at?: string;
}

export interface CampaignStats {
  outreach_generated: number;
  outreach_approved: number;
  outreach_sent: number;
}

// ---------- Outreach ----------

export type OutreachStatus =
  | 'generated'
  | 'under_review'
  | 'edited'
  | 'approved'
  | 'rejected'
  | 'sent';

export interface OutreachItem {
  id: number;
  contact_id: number | null;
  staff_id: number | null;
  institution_id: number | null;
  campaign_id: number | null;
  subject: string;
  body: string;
  status: OutreachStatus;
  personalization_vars?: Record<string, unknown> | null;
  approved_by?: string | null;
  approved_at?: string | null;
  rejection_reason?: string | null;
  generated_at?: string | null;
  sent_at?: string | null;
  hubspot_contact_id?: string | null;
  hubspot_message_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface OutreachListResponse {
  items: OutreachItem[];
  count: number;
}

export interface OutreachBulkGenerateResponse {
  generated: number;
  skipped: number;
  errors: number;
}

