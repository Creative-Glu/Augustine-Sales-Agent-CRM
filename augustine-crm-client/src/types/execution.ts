/** Job – batch processing of URLs from websites_url */
export interface Job {
  job_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  urls: string[];
  submitted_at: string;
  started_at: string | null;
  completed_at: string | null;
  error: string | null;
  error_traceback: string | null;
  summary: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  total_tokens: string | null;
  total_input_tokens: string | null;
  total_output_tokens: string | null;
  total_cached_tokens: string | null;
  token_usage_by_model: Record<string, unknown> | null;
}

/** Result – per-URL result from a job */
export interface Result {
  result_id: string;
  job_id: string;
  url: string;
  source: 'pdf' | 'web' | 'error';
  status: 'success' | 'error';
  processed_at: string;
  error: string | null;
  error_type: string | null;
  error_traceback: string | null;
  failed_at: string | null;
  created_at: string;
}

/** Sync status for HubSpot pipeline (staging in Supabase, source of truth in HubSpot). */
export type SyncStatus = 'pending' | 'success' | 'failed';

/** Staff – extracted staff details, linked to institution via institution_id */
export interface Staff {
  staff_id: number;
  result_id: string;
  institution_id: number;
  name: string;
  role: string | null;
  email: string | null;
  contact: string | null;
  contact_number: string | null;
  created_at: string;
  /** Set when staff is fetched with institution join (e.g. list view). */
  institutions?: { name: string } | null;
  /** Pipeline / HubSpot sync fields (optional until DB columns exist). */
  is_eligible?: boolean | null;
  synced_to_hubspot?: boolean | null;
  sync_status?: SyncStatus | null;
  enrichment_confidence?: number | null;
  webhook_attempts?: number | null;
  webhook_status?: string | null;
  last_synced_at?: string | null;
  sync_error?: string | null;
  hubspot_contact_id?: string | null;
}

/** Institution – from execution DB table institutions (id may be number or string from API) */
export interface Institution {
  id: number | string;
  name: string;
  email: string | null;
  contact: string | null;
  website_url: string | null;
  address: string | null;
  type: string | null;
  created_at: string;
  /** Pipeline / HubSpot sync fields (optional until DB columns exist). */
  is_eligible?: boolean | null;
  synced_to_hubspot?: boolean | null;
  sync_status?: SyncStatus | null;
  enrichment_confidence?: number | null;
  webhook_attempts?: number | null;
  webhook_status?: string | null;
  last_synced_at?: string | null;
  sync_error?: string | null;
  hubspot_company_id?: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  hasMore: boolean;
}
