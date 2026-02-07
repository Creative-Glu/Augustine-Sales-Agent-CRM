import { executionSupabase } from '@/lib/executionSupabaseClient';
import type { Job } from '@/types/execution';

export interface JobCounts {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
}

export interface WebsiteCounts {
  total: number;
  success: number;
  failed: number;
  processing: number;
  pending: number;
  missingUrl: number;
  other: number;
}

export interface ResultCounts {
  total: number;
  success: number;
  error: number;
}

export interface ExecutionStats {
  jobs: JobCounts;
  websites: WebsiteCounts;
  results: ResultCounts;
  institutions: number;
  staff: number;
}

async function countJobsByStatus(status: string): Promise<number> {
  const { count, error } = await executionSupabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('status', status);
  if (error) throw new Error(`Error counting jobs (${status}): ${error.message}`);
  return count ?? 0;
}

async function getJobCounts(): Promise<JobCounts> {
  const [totalRes, pending, running, completed, failed] = await Promise.all([
    executionSupabase.from('jobs').select('*', { count: 'exact', head: true }),
    countJobsByStatus('pending'),
    countJobsByStatus('running'),
    countJobsByStatus('completed'),
    countJobsByStatus('failed'),
  ]);
  const total = totalRes.error ? 0 : (totalRes.count ?? 0);
  return { total, pending, running, completed, failed };
}

async function countWebsitesByStatus(status: string): Promise<number> {
  const { count, error } = await executionSupabase
    .from('websites_url')
    .select('*', { count: 'exact', head: true })
    .ilike('Status', status);
  if (error) return 0;
  return count ?? 0;
}

async function getWebsiteCounts(): Promise<WebsiteCounts> {
  const [totalRes, success, failed, processing, pending, missingUrl] = await Promise.all([
    executionSupabase.from('websites_url').select('*', { count: 'exact', head: true }),
    countWebsitesByStatus('success'),
    countWebsitesByStatus('failed'),
    countWebsitesByStatus('Processing'),
    countWebsitesByStatus('Pending'),
    countWebsitesByStatus('Missing URL'),
  ]);
  const total = totalRes.error ? 0 : (totalRes.count ?? 0);
  const other = Math.max(0, total - success - failed - processing - pending - missingUrl);
  return {
    total,
    success,
    failed,
    processing,
    pending,
    missingUrl,
    other,
  };
}

async function getResultCounts(): Promise<ResultCounts> {
  const [successRes, errorRes] = await Promise.all([
    executionSupabase
      .from('results')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'success'),
    executionSupabase
      .from('results')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'error'),
  ]);
  const success = successRes.error ? 0 : (successRes.count ?? 0);
  const error = errorRes.error ? 0 : (errorRes.count ?? 0);
  const total = success + error;
  return { total, success, error };
}

async function getInstitutionCount(): Promise<number> {
  const { count, error } = await executionSupabase
    .from('institutions')
    .select('*', { count: 'exact', head: true });
  if (error) throw new Error(`Error counting institutions: ${error.message}`);
  return count ?? 0;
}

async function getStaffCount(): Promise<number> {
  const { count, error } = await executionSupabase
    .from('staff')
    .select('*', { count: 'exact', head: true });
  if (error) throw new Error(`Error counting staff: ${error.message}`);
  return count ?? 0;
}

export async function getExecutionStats(): Promise<ExecutionStats> {
  const [jobs, websites, results, institutions, staff] = await Promise.all([
    getJobCounts(),
    getWebsiteCounts(),
    getResultCounts(),
    getInstitutionCount(),
    getStaffCount(),
  ]);
  return { jobs, websites, results, institutions, staff };
}

const RECENT_JOBS_LIMIT = 15;

export async function getRecentJobs(): Promise<Job[]> {
  const { data, error } = await executionSupabase
    .from('jobs')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(RECENT_JOBS_LIMIT);
  if (error) throw new Error(`Error fetching recent jobs: ${error.message}`);
  return (data ?? []) as Job[];
}
