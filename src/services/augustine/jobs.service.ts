import { apiDelete, apiGet, apiPost } from '@/lib/augustineApiClient';
import type {
  JobDetail,
  JobProgressResponse,
  JobResultsResponse,
  JobsListResponse,
  JobSubmitResponse,
} from '@/types/augustine';

export async function submitJob(urls: string[]): Promise<JobSubmitResponse> {
  try {
    return apiPost<JobSubmitResponse, { urls: string[] }>('/jobs', { urls });
  } catch (error) {
    throw error instanceof Error ? error : new Error('submitJob failed');
  }
}

// Server-side pagination: GET /jobs?limit=&offset= (e.g. limit=20, offset=0 for page 1).
// Response includes jobs[] and total_jobs; use total_jobs to compute totalPages.
export async function listJobs(
  limit?: number,
  offset?: number
): Promise<JobsListResponse> {
  try {
    const sp = new URLSearchParams();
    if (limit != null) sp.set('limit', String(limit));
    if (offset != null) sp.set('offset', String(offset));
    const qs = sp.toString();
    const path = qs ? `/jobs?${qs}` : '/jobs';
    return apiGet<JobsListResponse>(path);
  } catch (error) {
    throw error instanceof Error ? error : new Error('listJobs failed');
  }
}

export async function getJob(jobId: string): Promise<JobDetail> {
  try {
    return apiGet<JobDetail>(`/jobs/${jobId}`);
  } catch (error) {
    throw error instanceof Error ? error : new Error('getJob failed');
  }
}

export async function getJobResults(jobId: string): Promise<JobResultsResponse> {
  try {
    return apiGet<JobResultsResponse>(`/jobs/${jobId}/results`);
  } catch (error) {
    throw error instanceof Error ? error : new Error('getJobResults failed');
  }
}

export async function getJobProgress(
  jobId: string,
  sinceId?: number
): Promise<JobProgressResponse> {
  try {
    const query = sinceId != null ? `?since_id=${sinceId}` : '';
    // Progress endpoint is namespaced under /api/jobs even though core jobs use /jobs
    return apiGet<JobProgressResponse>(`/api/jobs/${jobId}/progress${query}`);
  } catch (error) {
    throw error instanceof Error ? error : new Error('getJobProgress failed');
  }
}

export async function deleteJob(jobId: string): Promise<void> {
  try {
    await apiDelete<unknown>(`/jobs/${jobId}`);
  } catch (error) {
    throw error instanceof Error ? error : new Error('deleteJob failed');
  }
}
