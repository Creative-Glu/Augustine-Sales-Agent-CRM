import { executionSupabase } from '@/lib/executionSupabaseClient';
import type { Job, Result } from '@/types/execution';

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

export interface SyncPipelineCounts {
  eligible: number;
  synced: number;
  failed: number;
}

export interface ExecutionStats {
  jobs: JobCounts;
  websites: WebsiteCounts;
  results: ResultCounts;
  institutions: number;
  staff: number;
  /** Pipeline metrics: eligible / synced / failed (staff + institutions). */
  institutionSync?: SyncPipelineCounts;
  staffSync?: SyncPipelineCounts;
}

async function countJobsByStatus(status: string): Promise<number> {
  try {
    const { count, error } = await executionSupabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', status);
    if (error) throw new Error(`Error counting jobs (${status}): ${error.message}`);
    return count ?? 0;
  } catch (error) {
    throw error instanceof Error ? error : new Error('countJobsByStatus failed');
  }
}

async function getJobCounts(): Promise<JobCounts> {
  try {
    const [totalRes, pending, running, completed, failed] = await Promise.all([
      executionSupabase.from('jobs').select('*', { count: 'exact', head: true }),
      countJobsByStatus('pending'),
      countJobsByStatus('running'),
      countJobsByStatus('completed'),
      countJobsByStatus('failed'),
    ]);
    const total = totalRes.error ? 0 : (totalRes.count ?? 0);
    return { total, pending, running, completed, failed };
  } catch (error) {
    throw error instanceof Error ? error : new Error('getJobCounts failed');
  }
}

async function countWebsitesByStatus(status: string): Promise<number> {
  try {
    const { count, error } = await executionSupabase
      .from('websites_url')
      .select('*', { count: 'exact', head: true })
      .ilike('Status', status);
    if (error) return 0;
    return count ?? 0;
  } catch (error) {
    throw error instanceof Error ? error : new Error('countWebsitesByStatus failed');
  }
}

async function getWebsiteCounts(): Promise<WebsiteCounts> {
  try {
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
  } catch (error) {
    throw error instanceof Error ? error : new Error('getWebsiteCounts failed');
  }
}

async function getResultCounts(): Promise<ResultCounts> {
  try {
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
  } catch (error) {
    throw error instanceof Error ? error : new Error('getResultCounts failed');
  }
}

async function getInstitutionCount(): Promise<number> {
  try {
    const { count, error } = await executionSupabase
      .from('institutions')
      .select('*', { count: 'exact', head: true });
    if (error) throw new Error(`Error counting institutions: ${error.message}`);
    return count ?? 0;
  } catch (error) {
    throw error instanceof Error ? error : new Error('getInstitutionCount failed');
  }
}

async function getStaffCount(): Promise<number> {
  try {
    const { count, error } = await executionSupabase
      .from('staff')
      .select('*', { count: 'exact', head: true });
    if (error) throw new Error(`Error counting staff: ${error.message}`);
    return count ?? 0;
  } catch (error) {
    throw error instanceof Error ? error : new Error('getStaffCount failed');
  }
}

async function getSyncPipelineCounts(
  table: 'institutions' | 'staff',
  eligibleCol: string,
  syncedCol: string,
  statusCol: string
): Promise<SyncPipelineCounts> {
  try {
    const [eligibleRes, syncedRes, failedRes] = await Promise.all([
      executionSupabase.from(table).select('*', { count: 'exact', head: true }).eq(eligibleCol, true),
      executionSupabase.from(table).select('*', { count: 'exact', head: true }).eq(syncedCol, true),
      executionSupabase.from(table).select('*', { count: 'exact', head: true }).eq(statusCol, 'failed'),
    ]);
    return {
      eligible: eligibleRes.error ? 0 : (eligibleRes.count ?? 0),
      synced: syncedRes.error ? 0 : (syncedRes.count ?? 0),
      failed: failedRes.error ? 0 : (failedRes.count ?? 0),
    };
  } catch {
    return { eligible: 0, synced: 0, failed: 0 };
  }
}

export async function getExecutionStats(): Promise<ExecutionStats> {
  try {
    const [jobs, websites, results, institutions, staff, institutionSync, staffSync] = await Promise.all([
      getJobCounts(),
      getWebsiteCounts(),
      getResultCounts(),
      getInstitutionCount(),
      getStaffCount(),
      getSyncPipelineCounts('institutions', 'is_eligible', 'synced_to_hubspot', 'sync_status'),
      getSyncPipelineCounts('staff', 'is_eligible', 'synced_to_hubspot', 'sync_status'),
    ]);
    return {
      jobs,
      websites,
      results,
      institutions,
      staff,
      institutionSync,
      staffSync,
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error('getExecutionStats failed');
  }
}

const RECENT_JOBS_LIMIT = 8;

export async function getRecentJobs(): Promise<Job[]> {
  try {
    const { data, error } = await executionSupabase
      .from('jobs')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(RECENT_JOBS_LIMIT);
    if (error) throw new Error(`Error fetching recent jobs: ${error.message}`);
    return (data ?? []) as Job[];
  } catch (error) {
    throw error instanceof Error ? error : new Error('getRecentJobs failed');
  }
}

const RECENT_FAILED_RESULTS_LIMIT = 8;

export async function getRecentFailedResults(): Promise<Result[]> {
  try {
    const { data, error } = await executionSupabase
      .from('results')
      .select('*')
      .eq('status', 'error')
      .order('processed_at', { ascending: false })
      .limit(RECENT_FAILED_RESULTS_LIMIT);
    if (error) throw new Error(`Error fetching recent failed results: ${error.message}`);
    return (data ?? []) as Result[];
  } catch (error) {
    throw error instanceof Error ? error : new Error('getRecentFailedResults failed');
  }
}
