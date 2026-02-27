import { apiDelete, apiGet, apiPost } from '@/lib/augustineApiClient';
import type {
  JobDetail,
  JobResultsResponse,
  JobsListResponse,
  JobSubmitResponse,
} from '@/types/augustine';

export async function submitJob(urls: string[]): Promise<JobSubmitResponse> {
  return apiPost<JobSubmitResponse, { urls: string[] }>('/jobs', { urls });
}

export async function listJobs(): Promise<JobsListResponse> {
  return apiGet<JobsListResponse>('/jobs');
}

export async function getJob(jobId: string): Promise<JobDetail> {
  return apiGet<JobDetail>(`/jobs/${jobId}`);
}

export async function getJobResults(jobId: string): Promise<JobResultsResponse> {
  return apiGet<JobResultsResponse>(`/jobs/${jobId}/results`);
}

export async function deleteJob(jobId: string): Promise<void> {
  await apiDelete<unknown>(`/jobs/${jobId}`);
}

