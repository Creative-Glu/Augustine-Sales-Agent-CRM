import { apiDelete, apiGet, apiPost } from '@/lib/augustineApiClient';
import type {
  JobDetail,
  JobProgressResponse,
  JobResultsResponse,
  JobsListResponse,
  JobSubmitResponse,
} from '@/types/augustine';

export async function submitJob(urls: string[]): Promise<JobSubmitResponse> {
  return apiPost<JobSubmitResponse, { urls: string[] }>('/jobs', { urls });
}

// Server-side pagination: GET /jobs?limit=&offset= (e.g. limit=20, offset=0 for page 1).
// Response includes jobs[] and total_jobs; use total_jobs to compute totalPages.
export async function listJobs(
  limit?: number,
  offset?: number
): Promise<JobsListResponse> {
  const sp = new URLSearchParams();
  if (limit != null) sp.set('limit', String(limit));
  if (offset != null) sp.set('offset', String(offset));
  const qs = sp.toString();
  const path = qs ? `/jobs?${qs}` : '/jobs';
  return apiGet<JobsListResponse>(path);
}

export async function getJob(jobId: string): Promise<JobDetail> {
  return apiGet<JobDetail>(`/jobs/${jobId}`);
}

export async function getJobResults(jobId: string): Promise<JobResultsResponse> {
  return apiGet<JobResultsResponse>(`/jobs/${jobId}/results`);
}

export async function getJobProgress(
  jobId: string,
  sinceId?: number
): Promise<JobProgressResponse> {
  const query = sinceId != null ? `?since_id=${sinceId}` : '';
  // Progress endpoint is namespaced under /api/jobs even though core jobs use /jobs
  return apiGet<JobProgressResponse>(`/api/jobs/${jobId}/progress${query}`);
}

export async function deleteJob(jobId: string): Promise<void> {
  await apiDelete<unknown>(`/jobs/${jobId}`);
}

