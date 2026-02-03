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

/** Staff – extracted staff details from a result */
export interface Staff {
  staff_id: string;
  result_id: string;
  name: string;
  role: string | null;
  email: string | null;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  hasMore: boolean;
}
