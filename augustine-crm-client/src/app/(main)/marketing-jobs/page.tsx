'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
  deleteJob,
  getJob,
  getJobResults,
  listJobs,
  submitJob,
} from '@/services/augustine/jobs.service';
import type { JobDetail, JobResultItem, JobsListItem, JobStatus } from '@/types/augustine';
import { Activity, Plus, RefreshCw } from 'lucide-react';

const JOBS_DISPLAY_LIMIT = 100;
const RESULTS_DISPLAY_LIMIT = 300;

function parseUrls(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

function JobStatusBadge({ status }: { status: JobStatus }) {
  const base = 'inline-flex rounded-md text-xs font-medium px-2 py-1';
  const styles: Record<JobStatus, string> = {
    pending:
      'border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300',
    running:
      'border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300',
    completed:
      'border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300',
    failed:
      'border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300',
  };
  return <span className={`${base} ${styles[status]}`}>{status}</span>;
}

export default function MarketingJobsPage() {
  const [urlsText, setUrlsText] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const { toast } = useToast();

  const jobsQuery = useQuery({
    queryKey: ['augustine', 'jobs', 'list'],
    queryFn: listJobs,
    staleTime: 15_000,
  });

  const jobDetailQuery = useQuery({
    queryKey: ['augustine', 'jobs', 'detail', selectedJobId],
    queryFn: () =>
      selectedJobId ? getJob(selectedJobId) : Promise.resolve(null as JobDetail | null),
    enabled: !!selectedJobId,
    refetchInterval: polling ? 10_000 : false,
  });

  const resultsQuery = useQuery({
    queryKey: ['augustine', 'jobs', 'results', selectedJobId],
    queryFn: () =>
      selectedJobId
        ? getJobResults(selectedJobId)
        : Promise.resolve(null as { results: JobResultItem[]; summary?: unknown } | null),
    enabled: !!selectedJobId,
    refetchInterval: polling ? 10_000 : false,
  });

  useEffect(() => {
    const status = jobDetailQuery.data?.status;
    if (!status || status === 'completed' || status === 'failed') {
      setPolling(false);
    }
  }, [jobDetailQuery.data?.status]);

  const submitMutation = useMutation({
    mutationFn: (urls: string[]) => submitJob(urls),
    onSuccess: (res) => {
      toast({
        title: 'Job submitted',
        description: `Job ${res.job_id} queued with ${res.urls.length} URLs.`,
      });
      jobsQuery.refetch();
      setSelectedJobId(res.job_id);
      setPolling(true);
    },
    onError: (err: unknown) => {
      toast({
        title: 'Unable to submit job',
        description: err instanceof Error ? err.message : 'Check API connectivity and try again.',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (jobId: string) => deleteJob(jobId),
    onSuccess: (_, jobId) => {
      toast({ title: 'Job deleted', description: `Job ${jobId} was deleted.` });
      jobsQuery.refetch();
      if (selectedJobId === jobId) setSelectedJobId(null);
    },
    onError: (err: unknown) => {
      toast({
        title: 'Unable to delete job',
        description: err instanceof Error ? err.message : 'Try again later.',
        variant: 'destructive',
      });
    },
  });

  const allJobs: JobsListItem[] = jobsQuery.data?.jobs ?? [];
  const totalJobs = jobsQuery.data?.total_jobs ?? allJobs.length;
  const jobs = useMemo(
    () => allJobs.slice(0, JOBS_DISPLAY_LIMIT),
    [allJobs]
  );
  const hasMoreJobs = totalJobs > JOBS_DISPLAY_LIMIT;

  const allResults: JobResultItem[] = resultsQuery.data?.results ?? [];
  const results = useMemo(
    () => allResults.slice(0, RESULTS_DISPLAY_LIMIT),
    [allResults]
  );
  const hasMoreResults = allResults.length > RESULTS_DISPLAY_LIMIT;
  const resultsTotal = allResults.length;

  const onSubmit = () => {
    const urls = parseUrls(urlsText);
    if (urls.length === 0) {
      toast({
        title: 'Add at least one URL',
        description: 'Paste one or more institution URLs, one per line.',
        variant: 'destructive',
      });
      return;
    }
    submitMutation.mutate(urls);
  };

  const selectedJob = jobDetailQuery.data;
  const summary = useMemo(
    () => resultsQuery.data?.summary ?? selectedJob?.summary ?? null,
    [resultsQuery.data?.summary, selectedJob?.summary]
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
      <Header
        title="Scrape Jobs"
        subtitle="Submit institution URLs for scraping and track job progress."
        icon={<Activity className="w-6 h-6 text-white" />}
        showLive
      />

      <div className="px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1.5fr)] gap-6 items-start">
          {/* ——— LEFT: Submit + Jobs list ——— */}
          <div className="space-y-6">
            <section className="bg-card rounded-2xl border border-border shadow-sm p-6">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">
                Submit new job
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                Paste one or more institution URLs, one per line. The backend will scrape
                institutions and staff for each URL.
              </p>
              <Textarea
                className="min-h-[120px] transition-[color,box-shadow] duration-150"
                placeholder="https://example-parish.org/staff&#10;https://example-school.edu/faculty"
                value={urlsText}
                onChange={(e) => setUrlsText(e.target.value)}
              />
              <div className="flex items-center justify-between gap-3 mt-4">
                <p className="text-xs text-muted-foreground">
                  {parseUrls(urlsText).length} URLs ready to submit
                </p>
                <Button
                  type="button"
                  size="sm"
                  onClick={onSubmit}
                  disabled={submitMutation.isPending}
                  className="transition-all duration-150"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {submitMutation.isPending ? 'Submitting…' : 'Submit job'}
                </Button>
              </div>
            </section>

            <section className="bg-card rounded-2xl border border-border shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Jobs</h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => jobsQuery.refetch()}
                  disabled={jobsQuery.isLoading}
                  className="shrink-0 text-muted-foreground hover:text-foreground transition-colors duration-150"
                  aria-label="Refresh jobs"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${jobsQuery.isLoading ? 'animate-spin' : ''}`}
                  />
                </Button>
              </div>
              {hasMoreJobs && (
                <p className="text-xs text-muted-foreground mb-3">
                  Showing latest {JOBS_DISPLAY_LIMIT} of {totalJobs} jobs
                </p>
              )}
              <div className="border border-border/60 rounded-xl overflow-hidden bg-muted/30 max-h-[380px] overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 text-xs text-muted-foreground bg-muted/50">
                      <th className="py-3 pl-4 pr-3 text-left font-medium">Job ID</th>
                      <th className="py-3 px-3 text-left font-medium">Status</th>
                      <th className="py-3 px-3 text-right font-medium">URLs</th>
                      <th className="py-3 px-3 text-left font-medium">Submitted</th>
                      <th className="py-3 pl-3 pr-4 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobsQuery.isLoading && (
                      <>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <tr key={i} className="border-b border-border/40">
                            <td className="py-3 pl-4 pr-3">
                              <div className="h-4 w-20 rounded bg-muted/60 animate-pulse font-mono" />
                            </td>
                            <td className="py-3 px-3">
                              <div className="h-5 w-16 rounded bg-muted/50 animate-pulse" />
                            </td>
                            <td className="py-3 px-3">
                              <div className="h-4 w-8 rounded bg-muted/50 animate-pulse ml-auto" />
                            </td>
                            <td className="py-3 px-3">
                              <div className="h-4 w-24 rounded bg-muted/50 animate-pulse" />
                            </td>
                            <td className="py-3 pl-3 pr-4">
                              <div className="h-8 w-14 rounded bg-muted/50 animate-pulse ml-auto" />
                            </td>
                          </tr>
                        ))}
                      </>
                    )}
                    {!jobsQuery.isLoading && jobs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8">
                          <div className="flex flex-col items-center justify-center text-center">
                            <div className="rounded-full bg-muted/60 p-3 mb-3">
                              <Activity className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                              No jobs yet
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                              Submit your first scrape job above to get started.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                    {!jobsQuery.isLoading &&
                      jobs.map((job) => (
                        <tr
                          key={job.job_id}
                          className={`
                            border-b border-border/40 cursor-pointer transition-colors duration-150
                            ${selectedJobId === job.job_id
                              ? 'bg-indigo-50/70 dark:bg-indigo-950/30'
                              : 'hover:bg-muted/40'
                            }
                          `}
                          onClick={() => {
                            setSelectedJobId(job.job_id);
                            setPolling(job.status === 'pending' || job.status === 'running');
                          }}
                        >
                          <td className="py-3 pl-4 pr-3 font-mono text-xs text-slate-700 dark:text-slate-300">
                            {job.job_id.slice(0, 8)}…
                          </td>
                          <td className="py-3 px-3">
                            <JobStatusBadge status={job.status} />
                          </td>
                          <td className="py-3 px-3 text-right tabular-nums text-xs text-muted-foreground">
                            {job.urls_count}
                          </td>
                          <td className="py-3 px-3 text-xs text-muted-foreground">
                            {job.submitted_at
                              ? new Date(job.submitted_at).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '—'}
                          </td>
                          <td className="py-3 pl-3 pr-4 text-right">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteMutation.mutate(job.job_id);
                              }}
                              className="transition-all duration-150"
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* ——— RIGHT: Job detail & results ——— */}
          <section className="bg-card rounded-2xl border border-border shadow-sm p-6 flex flex-col min-h-[480px]">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Job detail & results
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Status, token usage, and per-URL institutions and staff.
                </p>
              </div>
              {selectedJobId && (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      jobDetailQuery.refetch();
                      resultsQuery.refetch();
                    }}
                    disabled={jobDetailQuery.isLoading || resultsQuery.isLoading}
                    className="transition-all duration-150"
                  >
                    Refresh
                  </Button>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                    <Input
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border-border"
                      checked={polling}
                      onChange={(e) => setPolling(e.target.checked)}
                    />
                    Poll
                  </label>
                </div>
              )}
            </div>

            {!selectedJobId && (
              <div className="flex-1 flex items-center justify-center p-8">
                <p className="text-sm text-muted-foreground text-center">
                  Select a job from the list to view its status and results.
                </p>
              </div>
            )}

            {selectedJobId && !selectedJob && jobDetailQuery.isLoading && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 rounded-lg bg-muted/50 animate-pulse" />
                  ))}
                </div>
                <div className="h-32 rounded-lg bg-muted/40 animate-pulse" />
              </div>
            )}

            {selectedJob && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Job ID
                    </p>
                    <p className="font-mono text-xs break-all">{selectedJob.job_id}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Status
                    </p>
                    <JobStatusBadge status={selectedJob.status} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Submitted
                    </p>
                    <p className="text-xs">
                      {selectedJob.submitted_at
                        ? new Date(selectedJob.submitted_at).toLocaleString()
                        : '—'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Started
                    </p>
                    <p className="text-xs">
                      {selectedJob.started_at
                        ? new Date(selectedJob.started_at).toLocaleString()
                        : '—'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Completed
                    </p>
                    <p className="text-xs">
                      {selectedJob.completed_at
                        ? new Date(selectedJob.completed_at).toLocaleString()
                        : '—'}
                    </p>
                  </div>
                </div>

                {summary && (
                  <div className="grid grid-cols-3 gap-4 py-3 border-y border-border/60 text-sm mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Websites</p>
                      <p className="font-medium">{summary.total_websites ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Processed</p>
                      <p className="font-medium">{summary.successfully_processed ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Failed</p>
                      <p className="font-medium">{summary.failed ?? '—'}</p>
                    </div>
                  </div>
                )}

                {selectedJob.error && (
                  <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive mb-4">
                    {selectedJob.error}
                  </div>
                )}
              </>
            )}

            <div className="mt-4 pt-4 border-t border-border/60 flex-1 min-h-0 flex flex-col">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Per-URL results
              </h3>
              {!selectedJobId && (
                <p className="text-xs text-muted-foreground">
                  Select a job to see per-URL institutions and staff.
                </p>
              )}
              {selectedJobId && resultsQuery.isLoading && (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-10 rounded bg-muted/50 animate-pulse"
                    />
                  ))}
                </div>
              )}
              {selectedJobId && !resultsQuery.isLoading && results.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No results yet. If the job is still pending or running, enable Poll and wait.
                </p>
              )}
              {selectedJobId && !resultsQuery.isLoading && results.length > 0 && (
                <>
                  {hasMoreResults && (
                    <p className="text-xs text-muted-foreground mb-2">
                      Showing first {RESULTS_DISPLAY_LIMIT} of {resultsTotal} results. Large jobs
                      may load slowly; consider filtering by status on the backend.
                    </p>
                  )}
                  <div className="border border-border/60 rounded-xl overflow-hidden bg-muted/30 max-h-[280px] overflow-y-auto flex-1 min-h-0">
                    <table className="min-w-full text-sm">
                      <thead className="sticky top-0 bg-muted/80 backdrop-blur border-b border-border/60 z-10">
                        <tr className="text-xs text-muted-foreground">
                          <th className="py-2.5 pl-4 pr-3 text-left font-medium">URL</th>
                          <th className="py-2.5 px-3 text-left font-medium">Source</th>
                          <th className="py-2.5 px-3 text-left font-medium">Status</th>
                          <th className="py-2.5 pl-3 pr-4 text-left font-medium">
                            Institutions / staff
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((r, idx) => (
                          <tr
                            key={`${r.url}-${idx}`}
                            className="border-b border-border/40 hover:bg-muted/40 transition-colors duration-150"
                          >
                            <td
                              className="py-2.5 pl-4 pr-3 max-w-[200px] truncate text-xs"
                              title={r.url}
                            >
                              {r.url}
                            </td>
                            <td className="py-2.5 px-3 text-xs text-muted-foreground">
                              {r.source}
                            </td>
                            <td className="py-2.5 px-3 text-xs">{r.status}</td>
                            <td className="py-2.5 pl-3 pr-4 text-xs text-muted-foreground">
                              {r.institutions?.length ?? 0} institutions, {r.staff?.length ?? 0}{' '}
                              staff
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
