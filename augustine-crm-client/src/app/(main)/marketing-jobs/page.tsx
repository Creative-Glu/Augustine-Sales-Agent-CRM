'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
  deleteJob,
  getJob,
  getJobProgress,
  getJobResults,
  listJobs,
  submitJob,
} from '@/services/augustine/jobs.service';
import type {
  JobDetail,
  JobProgressEvent,
  JobProgressSummary,
  JobResultItem,
  JobsListItem,
  JobsListResponse,
  JobStatus,
  JobSummary,
} from '@/types/augustine';
import { cn } from '@/lib/utils';
import { Activity, Copy, Plus, RefreshCw } from 'lucide-react';

const STAGES_ORDER = [
  'job_started',
  'url_processing',
  'extraction',
  'db_saving',
  'hubspot_sync',
  'completed',
] as const;
type StepKey = (typeof STAGES_ORDER)[number];
type StepState = 'pending' | 'active' | 'completed' | 'failed' | 'skipped';

type TokenUsageByModel = {
  call_count?: number;
  total_tokens?: number;
  input_tokens?: number;
  output_tokens?: number;
  cached_tokens?: number;
  estimated_cost_usd?: number;
};

type TokenUsage = {
  total_tokens?: number;
  total_input_tokens?: number;
  total_output_tokens?: number;
  total_cached_tokens?: number;
  estimated_cost_usd?: number;
  by_model?: Record<string, TokenUsageByModel>;
};

function eventStageToStep(stage: string): StepKey | null {
  if (stage.startsWith('job_started') || stage === 'job_started') return 'job_started';
  if (stage.startsWith('url_')) return 'url_processing';
  if (stage.startsWith('extraction')) return 'extraction';
  if (stage.startsWith('db_')) return 'db_saving';
  if (stage.startsWith('hubspot')) return 'hubspot_sync';
  if (stage.includes('completed') || stage.includes('failed')) return 'completed';
  return null;
}

function eventDotColor(stage: string): string {
  if (stage.includes('failed') || stage.includes('error'))
    return 'bg-destructive';
  if (stage.includes('skipped')) return 'bg-amber-500';
  if (stage.includes('completed') || stage === 'job_completed')
    return 'bg-green-500';
  if (stage.startsWith('hubspot')) return 'bg-teal-500';
  if (stage.startsWith('url_')) return 'bg-indigo-500';
  if (stage.startsWith('extraction')) return 'bg-purple-500';
  if (stage.startsWith('fallback')) return 'bg-amber-500';
  if (stage.startsWith('db_')) return 'bg-blue-500';
  return 'bg-blue-500';
}

const JOBS_PAGE_SIZE = 20;
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

function getJobsPage(searchParams: URLSearchParams): number {
  const p = searchParams.get('page');
  const n = p ? parseInt(p, 10) : NaN;
  return Number.isNaN(n) || n < 1 ? 1 : n;
}

function getJobsLimit(searchParams: URLSearchParams, defaultLimit: number): number {
  const p = searchParams.get('limit');
  const n = p ? parseInt(p, 10) : NaN;
  return Number.isNaN(n) || n < 1 ? defaultLimit : Math.min(100, n);
}

export default function MarketingJobsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [urlsText, setUrlsText] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [progressEvents, setProgressEvents] = useState<JobProgressEvent[]>([]);
  const [progressSummary, setProgressSummary] = useState<JobProgressSummary | null>(null);
  const [progressStatus, setProgressStatus] = useState<JobStatus | null>(null);
  const [lastEventId, setLastEventId] = useState<number | null>(null);
  const [isProgressLoading, setIsProgressLoading] = useState(false);
  const [autoScrollTimeline, setAutoScrollTimeline] = useState(true);
  const [showOnlyErrors, setShowOnlyErrors] = useState(false);
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  const page = getJobsPage(searchParams);
  const limit = getJobsLimit(searchParams, JOBS_PAGE_SIZE);
  const offset = (page - 1) * limit;

  const jobsQuery = useQuery({
    queryKey: ['augustine', 'jobs', 'list', { limit, offset }],
    queryFn: () => listJobs(limit, offset),
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

  // Initial progress load when job selected
  useEffect(() => {
    setProgressEvents([]);
    setProgressSummary(null);
    setProgressStatus(null);
    setLastEventId(null);
    setAutoScrollTimeline(true);
    if (!selectedJobId) return;
    let cancelled = false;
    setIsProgressLoading(true);
    getJobProgress(selectedJobId)
      .then((res) => {
        if (cancelled) return;
        setProgressEvents(res.events ?? []);
        setProgressSummary(res.summary ?? null);
        setProgressStatus(res.job_status);
        const maxId =
          res.events?.length ? Math.max(...res.events.map((e) => e.id)) : null;
        setLastEventId(maxId);
      })
      .catch(() => {
        if (!cancelled) {
          setProgressStatus(null);
          setProgressSummary(null);
        }
      })
      .finally(() => {
        if (!cancelled) setIsProgressLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedJobId]);

  // Poll progress every 1500ms while running/pending
  useEffect(() => {
    if (!selectedJobId) return;
    const effectiveStatus = progressStatus ?? jobDetailQuery.data?.status;
    if (effectiveStatus !== 'pending' && effectiveStatus !== 'running') return;

    let cancelled = false;
    const id = window.setInterval(async () => {
      try {
        const res = await getJobProgress(
          selectedJobId,
          lastEventId ?? undefined
        );
        if (cancelled) return;
        if (res.events?.length) {
          setProgressEvents((prev) => {
            const existingIds = new Set(prev.map((e) => e.id));
            const merged = [
              ...prev,
              ...res.events.filter((e) => !existingIds.has(e.id)),
            ];
            return merged.sort((a, b) => a.id - b.id);
          });
          const maxId = Math.max(...res.events.map((e) => e.id));
          setLastEventId((prev) =>
            prev == null ? maxId : Math.max(prev, maxId)
          );
        }
        setProgressSummary(res.summary ?? null);
        setProgressStatus(res.job_status);
      } catch {
        // ignore polling errors
      }
    }, 1500);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [selectedJobId, progressStatus, jobDetailQuery.data?.status, lastEventId]);

  // Auto-scroll timeline to bottom when new events and auto-scroll on
  useEffect(() => {
    if (!autoScrollTimeline || !timelineRef.current) return;
    const el = timelineRef.current;
    el.scrollTop = el.scrollHeight;
  }, [progressEvents.length, autoScrollTimeline]);

  const handleTimelineScroll = useCallback(() => {
    if (!timelineRef.current) return;
    const el = timelineRef.current;
    const distanceFromBottom =
      el.scrollHeight - (el.scrollTop + el.clientHeight);
    setAutoScrollTimeline(distanceFromBottom < 24);
  }, []);

  const setJobsPage = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(Math.max(1, newPage)));
      if (limit !== JOBS_PAGE_SIZE) params.set('limit', String(limit));
      router.push(`?${params.toString()}`);
    },
    [router, searchParams, limit]
  );

  const submitMutation = useMutation({
    mutationFn: (urls: string[]) => submitJob(urls),
    onSuccess: (res) => {
      toast({
        title: 'Job submitted',
        description: `Job ${res.job_id} queued with ${res.urls.length} URLs.`,
      });
      setJobsPage(1);
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
      setJobsPage(1);
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

  const jobsData = jobsQuery.data as JobsListResponse | undefined;
  const jobs: JobsListItem[] = jobsData?.jobs ?? [];
  const totalJobs = jobsData?.total_jobs ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalJobs / limit));
  const hasPrevJobs = page > 1;
  const hasNextJobs = page < totalPages;
  const rangeStart = totalJobs === 0 ? 0 : offset + 1;
  const rangeEnd = Math.min(offset + jobs.length, totalJobs);

  const allResults: JobResultItem[] = resultsQuery.data?.results ?? [];
  const results = useMemo(
    () => allResults.slice(0, RESULTS_DISPLAY_LIMIT),
    [allResults]
  );
  const hasMoreResults = allResults.length > RESULTS_DISPLAY_LIMIT;
  const resultsTotal = allResults.length;

  const successfulResults = useMemo(
    () =>
      allResults.filter(
        (r) => String(r.status).toLowerCase() === 'success'
      ),
    [allResults]
  );
  const numSuccessful = successfulResults.length;

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
  const tokenUsage: TokenUsage | null = useMemo(
    () =>
      (selectedJob?.token_usage ?? null) as TokenUsage | null,
    [selectedJob?.token_usage]
  );
  const summary = useMemo(
    () =>
      (resultsQuery.data?.summary ??
        selectedJob?.summary ??
        null) as JobSummary | null,
    [resultsQuery.data?.summary, selectedJob?.summary]
  );

  const totalTokens =
    (tokenUsage?.total_tokens as number | undefined) ?? 0;
  const totalCostUsd =
    (tokenUsage?.estimated_cost_usd as number | undefined) ?? 0;
  const avgCostPerSite =
    numSuccessful > 0 ? totalCostUsd / numSuccessful : 0;

  const hasTokenUsage =
    tokenUsage != null &&
    (typeof tokenUsage.total_tokens === 'number' ||
      typeof tokenUsage.estimated_cost_usd === 'number' ||
      (tokenUsage.by_model &&
        Object.keys(tokenUsage.by_model).length > 0));

  const formatInteger = (value: number) =>
    new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(value);

  const formatUsd = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 6,
    }).format(value);

  const effectiveStatus =
    progressStatus ?? selectedJob?.status ?? ('pending' as JobStatus);
  const rawTotal =
    progressSummary?.urls_total ?? summary?.total_websites ?? 0;
  const rawProcessed =
    progressSummary?.urls_processed ?? summary?.successfully_processed ?? 0;
  const urlsTotal =
    typeof rawTotal === 'number' && Number.isFinite(rawTotal) ? rawTotal : 0;
  const urlsProcessed =
    typeof rawProcessed === 'number' && Number.isFinite(rawProcessed)
      ? rawProcessed
      : 0;
  const progressPct =
    urlsTotal > 0 ? Math.round((urlsProcessed / urlsTotal) * 100) : 0;

  const visibleEvents = useMemo(() => {
    if (!showOnlyErrors) return progressEvents;
    return progressEvents.filter(
      (e) =>
        (typeof e.stage === 'string' && e.stage.includes('failed')) ||
        (typeof e.stage === 'string' && e.stage.includes('error')) ||
        (typeof e.message === 'string' &&
          e.message.toLowerCase().includes('error'))
    );
  }, [progressEvents, showOnlyErrors]);

  const stepStates = useMemo(() => {
    let highestReached = -1;
    let failedIdx = -1;
    const skippedIdxs = new Set<number>();
    const stageStr = (s: unknown) =>
      typeof s === 'string' ? s : s != null ? String(s) : '';
    progressEvents.forEach((e) => {
      const stage = stageStr(e.stage);
      const step = eventStageToStep(stage);
      if (!step) return;
      const idx = STAGES_ORDER.indexOf(step);
      if (idx > highestReached) highestReached = idx;
      if (stage.includes('failed') && failedIdx < 0) failedIdx = idx;
      if (stage.includes('skipped')) skippedIdxs.add(idx);
    });
    const states: Record<StepKey, StepState> = {} as Record<StepKey, StepState>;
    STAGES_ORDER.forEach((key, idx) => {
      if (idx === failedIdx) states[key] = 'failed';
      else if (skippedIdxs.has(idx)) states[key] = 'skipped';
      else if (idx < highestReached) states[key] = 'completed';
      else if (idx === highestReached)
        states[key] =
          effectiveStatus === 'completed' ? 'completed' : 'active';
      else states[key] = 'pending';
    });
    return states;
  }, [progressEvents, effectiveStatus]);

  const copyLogs = useCallback(() => {
    const msgStr = (v: unknown) =>
      typeof v === 'string' ? v : v != null ? JSON.stringify(v) : '';
    const text = progressEvents
      .map(
        (e) =>
          `[${new Date(e.created_at).toISOString()}] ${e.stage}: ${msgStr(e.message)}${
            e.details ? `\n  ${msgStr(e.details)}` : ''
          }`
      )
      .join('\n');
    navigator.clipboard.writeText(text).then(
      () => toast({ title: 'Logs copied to clipboard' }),
      () => toast({ title: 'Failed to copy', variant: 'destructive' })
    );
  }, [progressEvents, toast]);

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
              <div className="flex items-center justify-between mb-2">
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
              <div className="flex items-center justify-between gap-3 mb-3 text-xs text-muted-foreground">
                <p>
                  {totalJobs > 0
                    ? `Showing ${rangeStart}–${rangeEnd} of ${totalJobs} jobs`
                    : jobsQuery.isLoading
                      ? 'Loading…'
                      : 'No jobs.'}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 px-2"
                    disabled={!hasPrevJobs || jobsQuery.isLoading}
                    onClick={() => setJobsPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="tabular-nums text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 px-2"
                    disabled={!hasNextJobs || jobsQuery.isLoading}
                    onClick={() => setJobsPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
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

            {selectedJobId && (
              <>
                {effectiveStatus === 'completed' && (
                  <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-xs text-green-800 dark:border-green-800 dark:bg-green-950/40 dark:text-green-200">
                    Job completed successfully.
                  </div>
                )}
                {effectiveStatus === 'failed' && (
                  <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-2 text-xs text-destructive">
                    Job failed. Check event timeline and error details below.
                  </div>
                )}

                <div className="mb-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <JobStatusBadge status={effectiveStatus} />
                      <span className="text-xs text-muted-foreground">
                        {urlsProcessed} / {urlsTotal || '—'} URLs
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>
                        Institutions:{' '}
                        {typeof progressSummary?.institutions_extracted === 'number'
                          ? progressSummary.institutions_extracted
                          : '—'}
                      </span>
                      <span>
                        Staff:{' '}
                        {typeof progressSummary?.staff_extracted === 'number'
                          ? progressSummary.staff_extracted
                          : '—'}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-[width] duration-500',
                        effectiveStatus === 'completed' && 'bg-green-500',
                        effectiveStatus === 'failed' && 'bg-destructive',
                        effectiveStatus === 'running' && 'bg-indigo-500',
                        (effectiveStatus === 'pending' || effectiveStatus === 'running') &&
                          'animate-pulse',
                        effectiveStatus === 'pending' && 'bg-muted-foreground/60'
                      )}
                      style={{
                        width: `${Math.min(100, progressPct)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="mb-4 flex items-center justify-between gap-2">
                  {STAGES_ORDER.map((stage, idx) => {
                    const state = stepStates[stage];
                    const isLast = idx === STAGES_ORDER.length - 1;
                    return (
                      <div key={stage} className="flex flex-1 items-center">
                        <div className="flex flex-col items-center gap-1">
                          <div
                            className={cn(
                              'flex items-center justify-center rounded-full border-2 size-6 text-[10px] font-semibold',
                              state === 'pending' &&
                                'border-muted-foreground/40 bg-transparent text-muted-foreground',
                              state === 'active' &&
                                'border-indigo-500 bg-indigo-500/20 text-indigo-600 dark:text-indigo-400',
                              state === 'active' && 'animate-pulse',
                              state === 'completed' &&
                                'border-green-500 bg-green-500 text-white',
                              state === 'failed' &&
                                'border-destructive bg-destructive text-destructive-foreground'
                            )}
                          >
                            {idx + 1}
                          </div>
                          <span className="text-[10px] text-muted-foreground text-center leading-tight">
                            {stage.replace(/_/g, ' ')}
                          </span>
                        </div>
                        {!isLast && (
                          <div className="flex-1 h-px mx-0.5 bg-border/60 min-w-2" />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mb-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Live events
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <Input
                          type="checkbox"
                          className="h-3.5 w-3.5 rounded border-border"
                          checked={showOnlyErrors}
                          onChange={(e) => setShowOnlyErrors(e.target.checked)}
                        />
                        Errors only
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <Input
                          type="checkbox"
                          className="h-3.5 w-3.5 rounded border-border"
                          checked={autoScrollTimeline}
                          onChange={(e) => setAutoScrollTimeline(e.target.checked)}
                        />
                        Auto-scroll
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 text-muted-foreground"
                        onClick={copyLogs}
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copy logs
                      </Button>
                    </div>
                  </div>
                  <div
                    ref={timelineRef}
                    onScroll={handleTimelineScroll}
                    className="border border-border/60 rounded-xl bg-muted/30 max-h-[200px] overflow-y-auto px-4 py-3 space-y-3"
                  >
                    {isProgressLoading && progressEvents.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        Loading job progress…
                      </p>
                    )}
                    {!isProgressLoading && visibleEvents.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        Waiting for job to start…
                      </p>
                    )}
                    {visibleEvents.map((e) => {
                      const msg =
                        typeof e.message === 'string'
                          ? e.message
                          : e.message != null
                            ? JSON.stringify(e.message)
                            : '';
                      const details =
                        typeof e.details === 'string'
                          ? e.details
                          : e.details != null
                            ? JSON.stringify(e.details)
                            : null;
                      const stageStr =
                        typeof e.stage === 'string'
                          ? e.stage
                          : e.stage != null
                            ? String(e.stage)
                            : '';
                      return (
                        <div
                          key={e.id}
                          className="flex gap-3 animate-in fade-in-0 duration-200"
                        >
                          <div className="flex flex-col items-center pt-0.5">
                            <span
                              className={cn(
                                'size-2 rounded-full shrink-0',
                                eventDotColor(stageStr)
                              )}
                            />
                          </div>
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <p className="text-xs font-medium text-slate-800 dark:text-slate-100 wrap-break-word">
                              {msg}
                            </p>
                            {details && (
                              <p className="text-[11px] text-muted-foreground whitespace-pre-line wrap-break-word">
                                {details}
                              </p>
                            )}
                            <p className="text-[10px] text-muted-foreground">
                              {typeof e.created_at === 'string'
                                ? new Date(e.created_at).toLocaleTimeString()
                                : '—'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
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

                {hasTokenUsage && (
                  <section className="mb-4 space-y-3">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Token usage &amp; cost
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5">
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">
                          Total tokens
                        </p>
                        <p className="text-base font-semibold text-foreground tabular-nums">
                          {totalTokens > 0 ? formatInteger(totalTokens) : '—'}
                        </p>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5">
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">
                          Total cost (USD)
                        </p>
                        <p className="text-base font-semibold text-foreground tabular-nums">
                          {totalCostUsd > 0 ? formatUsd(totalCostUsd) : '$0.0000'}
                        </p>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5">
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">
                          Avg cost per website
                        </p>
                        <p className="text-base font-semibold text-foreground tabular-nums">
                          {numSuccessful > 0 && avgCostPerSite > 0
                            ? formatUsd(avgCostPerSite)
                            : '—'}
                        </p>
                      </div>
                    </div>

                    {tokenUsage?.by_model &&
                      Object.keys(tokenUsage.by_model).length > 0 && (
                        <div className="border border-border/60 rounded-xl overflow-hidden bg-muted/20">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-border/60 bg-muted/40 text-[11px] text-muted-foreground">
                                <th className="py-2.5 px-3 text-left font-medium">Model</th>
                                <th className="py-2.5 px-3 text-left font-medium">Provider</th>
                                <th className="py-2.5 px-3 text-right font-medium">Calls</th>
                                <th className="py-2.5 px-3 text-right font-medium">Input tokens</th>
                                <th className="py-2.5 px-3 text-right font-medium">Output tokens</th>
                                <th className="py-2.5 px-3 text-right font-medium">Cost (USD)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(tokenUsage.by_model).map(
                                ([model, stats]) => {
                                  const provider =
                                    /llama-3\.1|llama-3\.2|groq/i.test(model)
                                      ? 'Groq'
                                      : 'Other';
                                  const calls = stats.call_count ?? 0;
                                  const input = stats.input_tokens ?? 0;
                                  const output = stats.output_tokens ?? 0;
                                  const cost =
                                    stats.estimated_cost_usd ?? undefined;
                                  return (
                                    <tr
                                      key={model}
                                      className="border-b border-border/40 last:border-b-0"
                                    >
                                      <td className="py-2.5 px-3 text-foreground">
                                        <span className="font-medium">
                                          {model}
                                        </span>
                                      </td>
                                      <td className="py-2.5 px-3 text-muted-foreground">
                                        {provider}
                                      </td>
                                      <td className="py-2.5 px-3 text-right tabular-nums">
                                        {calls > 0 ? formatInteger(calls) : '—'}
                                      </td>
                                      <td className="py-2.5 px-3 text-right tabular-nums">
                                        {input > 0 ? formatInteger(input) : '—'}
                                      </td>
                                      <td className="py-2.5 px-3 text-right tabular-nums">
                                        {output > 0
                                          ? formatInteger(output)
                                          : '—'}
                                      </td>
                                      <td className="py-2.5 px-3 text-right tabular-nums">
                                        {typeof cost === 'number'
                                          ? formatUsd(cost)
                                          : '—'}
                                      </td>
                                    </tr>
                                  );
                                }
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                  </section>
                )}

                {summary && (
                  <div className="grid grid-cols-3 gap-4 py-3 border-y border-border/60 text-sm mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Websites</p>
                      <p className="font-medium">
                        {typeof summary.total_websites === 'number'
                          ? summary.total_websites
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Processed</p>
                      <p className="font-medium">
                        {typeof summary.successfully_processed === 'number'
                          ? summary.successfully_processed
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Failed</p>
                      <p className="font-medium">
                        {typeof summary.failed === 'number' ? summary.failed : '—'}
                      </p>
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
