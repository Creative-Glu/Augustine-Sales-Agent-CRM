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
import type { JobDetail, JobResultItem, JobsListItem } from '@/types/augustine';

function parseUrls(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

export default function MarketingJobsPage() {
  const [urlsText, setUrlsText] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const { toast } = useToast();

  const jobsQuery = useQuery({
    queryKey: ['augustine', 'jobs', 'list'],
    queryFn: listJobs,
    staleTime: 10_000,
  });

  const jobDetailQuery = useQuery({
    queryKey: ['augustine', 'jobs', 'detail', selectedJobId],
    queryFn: () => (selectedJobId ? getJob(selectedJobId) : Promise.resolve(null as JobDetail | null)),
    enabled: !!selectedJobId,
    refetchInterval: polling ? 10_000 : false,
  });

  const resultsQuery = useQuery({
    queryKey: ['augustine', 'jobs', 'results', selectedJobId],
    queryFn: () => (selectedJobId ? getJobResults(selectedJobId) : Promise.resolve(null as any)),
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
    onError: (err: any) => {
      toast({
        title: 'Unable to submit job',
        description: err?.message ?? 'Check API connectivity and try again.',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (jobId: string) => deleteJob(jobId),
    onSuccess: (_, jobId) => {
      toast({
        title: 'Job deleted',
        description: `Job ${jobId} was deleted.`,
      });
      jobsQuery.refetch();
      if (selectedJobId === jobId) {
        setSelectedJobId(null);
      }
    },
    onError: (err: any) => {
      toast({
        title: 'Unable to delete job',
        description: err?.message ?? 'Try again later.',
        variant: 'destructive',
      });
    },
  });

  const jobs: JobsListItem[] = jobsQuery.data?.jobs ?? [];

  const results: JobResultItem[] = resultsQuery.data?.results ?? [];

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

  const summary = useMemo(() => {
    return resultsQuery.data?.summary ?? selectedJob?.summary ?? null;
  }, [resultsQuery.data?.summary, selectedJob?.summary]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header
        title="Scraper jobs"
        subtitle="Submit institution URLs for scraping and track job progress."
        icon={<span className="text-white text-lg font-semibold">JB</span>}
        showLive
      />

      <div className="px-6 py-6 grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1.5fr)] gap-6 items-start">
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border shadow-sm p-4 space-y-3">
            <h2 className="text-sm font-semibold">Submit new job</h2>
            <p className="text-xs text-muted-foreground">
              Paste one or more institution URLs, one per line. The backend will scrape institutions and staff for each URL.
            </p>
            <Textarea
              className="min-h-[140px]"
              placeholder="https://example-parish.org/staff&#10;https://example-school.edu/faculty"
              value={urlsText}
              onChange={(e) => setUrlsText(e.target.value)}
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {parseUrls(urlsText).length} URLs ready to submit.
              </p>
              <Button
                type="button"
                size="sm"
                onClick={onSubmit}
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? 'Submitting…' : 'Submit job'}
              </Button>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Jobs</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => jobsQuery.refetch()}
              >
                Refresh
              </Button>
            </div>
            <div className="border border-border/60 rounded-lg overflow-hidden bg-muted/40 max-h-[360px] overflow-y-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-muted/70 border-b border-border/60">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Job ID</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">URLs</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Submitted</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobsQuery.isLoading && (
                    <tr>
                      <td colSpan={5} className="px-3 py-4 text-center text-muted-foreground">
                        Loading jobs…
                      </td>
                    </tr>
                  )}
                  {!jobsQuery.isLoading && jobs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-4 text-center text-muted-foreground">
                        No jobs yet. Submit your first scrape job above.
                      </td>
                    </tr>
                  )}
                  {!jobsQuery.isLoading &&
                    jobs.map((job) => (
                      <tr
                        key={job.job_id}
                        className={`border-b border-border/40 hover:bg-muted/50 cursor-pointer ${
                          selectedJobId === job.job_id ? 'bg-muted/70' : ''
                        }`}
                        onClick={() => {
                          setSelectedJobId(job.job_id);
                          setPolling(job.status === 'pending' || job.status === 'running');
                        }}
                      >
                        <td className="px-3 py-2 font-mono">{job.job_id.slice(0, 8)}…</td>
                        <td className="px-3 py-2 capitalize">{job.status}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{job.urls_count}</td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {job.submitted_at ? new Date(job.submitted_at).toLocaleString() : '—'}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Button
                            type="button"
                            size="xs"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMutation.mutate(job.job_id);
                            }}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm p-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Job detail & results</h2>
              <p className="text-xs text-muted-foreground">
                See status, token usage, and per-URL institutions and staff.
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
                >
                  Refresh
                </Button>
                <label className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Input
                    type="checkbox"
                    className="h-3 w-3"
                    checked={polling}
                    onChange={(e) => setPolling(e.target.checked)}
                  />
                  Poll
                </label>
              </div>
            )}
          </div>

          {!selectedJobId && (
            <p className="text-sm text-muted-foreground">
              Select a job from the left-hand table to inspect its status and results.
            </p>
          )}

          {selectedJobId && !selectedJob && jobDetailQuery.isLoading && (
            <p className="text-sm text-muted-foreground">Loading job details…</p>
          )}

          {selectedJob && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Job ID</p>
                  <p className="font-mono text-[11px]">{selectedJob.job_id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{selectedJob.status}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Submitted</p>
                  <p>{selectedJob.submitted_at ? new Date(selectedJob.submitted_at).toLocaleString() : '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Started</p>
                  <p>{selectedJob.started_at ? new Date(selectedJob.started_at).toLocaleString() : '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Completed</p>
                  <p>{selectedJob.completed_at ? new Date(selectedJob.completed_at).toLocaleString() : '—'}</p>
                </div>
              </div>

              {summary && (
                <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Websites</p>
                    <p className="font-medium">{summary.total_websites ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Processed</p>
                    <p className="font-medium">{summary.successfully_processed ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Failed</p>
                    <p className="font-medium">{summary.failed ?? '—'}</p>
                  </div>
                </div>
              )}

              {selectedJob.error && (
                <div className="mt-3 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                  {selectedJob.error}
                </div>
              )}
            </>
          )}

          <div className="mt-4 border-t border-border/60 pt-3 space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground">
              Per-URL results
            </h3>
            {!selectedJobId && (
              <p className="text-xs text-muted-foreground">
                Select a job to see per-URL institutions and staff.
              </p>
            )}
            {selectedJobId && resultsQuery.isLoading && (
              <p className="text-xs text-muted-foreground">Loading results…</p>
            )}
            {selectedJobId && !resultsQuery.isLoading && results.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No results yet. If the job is still pending or running, keep polling.
              </p>
            )}
            {results.length > 0 && (
              <div className="border border-border/60 rounded-lg max-h-[260px] overflow-y-auto bg-muted/40">
                <table className="min-w-full text-xs">
                  <thead className="bg-muted/70 border-b border-border/60">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">URL</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Source</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                        Institutions / staff
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, idx) => (
                      <tr key={`${r.url}-${idx}`} className="border-b border-border/40">
                        <td className="px-3 py-2 max-w-[220px] truncate" title={r.url}>
                          {r.url}
                        </td>
                        <td className="px-3 py-2">{r.source}</td>
                        <td className="px-3 py-2">{r.status}</td>
                        <td className="px-3 py-2">
                          <p className="text-[11px] text-muted-foreground">
                            {r.institutions?.length ?? 0} institutions, {r.staff?.length ?? 0} staff
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

