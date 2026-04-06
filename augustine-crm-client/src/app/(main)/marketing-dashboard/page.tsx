'use client';

import { Header } from '@/components/Header';
import { useAugustineMetrics } from '@/services/augustine/useAugustineMetrics';
import DashboardCard from '@/app/(main)/dashboard/_components/DashboardCard';
import { Bar } from 'react-chartjs-2';
import { useQuery } from '@tanstack/react-query';
import { listJobs, getJob } from '@/services/augustine/jobs.service';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { Activity, Database, Mail, TrendingUp, Clock } from 'lucide-react';
import type { Campaign } from '@/types/augustine';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function MarketingDashboardPage() {
  const { overview, system, campaigns, isLoading, isError } = useAugustineMetrics();
  const {
    data: jobCostMetrics,
  } = useQuery({
    queryKey: ['augustine', 'jobs', 'token-cost-metrics'],
    queryFn: async () => {
      // Fetch a window of recent jobs and aggregate token usage.
      const list = await listJobs(50, 0);
      const jobs = list.jobs ?? [];
      if (!jobs.length) {
        return { totalCost: 0, avgCostPerSite: 0, totalUrls: 0, jobCount: 0 };
      }
      const details = await Promise.all(
        jobs.map((j) =>
          getJob(j.job_id).catch(() => null)
        )
      );
      let totalCost = 0;
      let totalUrls = 0;
      let jobCount = 0;
      for (const job of details) {
        if (!job || !job.token_usage) continue;
        const tu = job.token_usage as any;
        const cost = typeof tu.estimated_cost_usd === 'number' ? tu.estimated_cost_usd : 0;
        const urlsCount = Array.isArray(job.urls) ? job.urls.length : 0;
        if (cost > 0) {
          totalCost += cost;
          jobCount += 1;
          totalUrls += urlsCount;
        }
      }
      const avgCostPerSite =
        totalUrls > 0 && totalCost > 0 ? totalCost / totalUrls : 0;
      return { totalCost, avgCostPerSite, totalUrls, jobCount };
    },
    staleTime: 60_000,
  });

  const formatUsd = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 6,
    }).format(value);

  const enrichmentRate =
    overview && overview.total_contacts > 0
      ? `${Math.round((overview.enriched_contacts / overview.total_contacts) * 100)}%`
      : '—';

  const contactsStats = [
    {
      title: 'Total contacts',
      value: overview?.total_contacts ?? 0,
      subtitle: 'All known contacts',
      icon: Database,
      color: 'from-blue-100 via-blue-200 to-blue-300',
    },
    {
      title: 'Enriched',
      value: overview?.enriched_contacts ?? 0,
      subtitle: 'With enrichment data',
      icon: Activity,
      color: 'from-emerald-100 via-emerald-200 to-emerald-300',
    },
    {
      title: 'Enrichment rate',
      value: enrichmentRate,
      subtitle: 'Contacts meeting quality target',
      icon: TrendingUp,
      color: 'from-sky-100 via-sky-200 to-sky-300',
    },
    {
      title: 'Websites scraped',
      value: jobCostMetrics?.totalUrls ?? 0,
      subtitle: 'Across recent scrape jobs',
      icon: Mail,
      color: 'from-violet-100 via-violet-200 to-violet-300',
    },
  ];

  const enrichmentDistribution = overview?.enrichment_confidence_distribution ?? {};
  const distributionLabels = Object.keys(enrichmentDistribution).sort();
  const distributionValues = distributionLabels.map((k) => enrichmentDistribution[k] ?? 0);

  const campaignMetrics: { name: string; generated: number; sent: number }[] = campaigns.map((c: Campaign) => {
    const generated = overview?.outreach_generated_by_campaign?.[c.id] ?? 0;
    const sent = overview?.outreach_sent_by_campaign?.[c.id] ?? 0;
    return { name: c.name, generated, sent };
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
      <Header
        title="Lead Gen & Outreach Scorecard"
        subtitle="Weekly and monthly view of contacts, enrichment, sync, and outreach."
        icon={<TrendingUp className="w-6 h-6 text-white" />}
        showLive
      />

      <div className="px-6 py-8 space-y-8">
        {isError && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            Unable to load metrics from the Augustine backend. Check API availability and auth.
          </div>
        )}

        <section>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
            Contacts & sync
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactsStats.map((stat) => (
              <DashboardCard key={stat.title} {...stat} />
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-6">
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Enrichment confidence distribution
              </h2>
              {isLoading && (
                <span className="text-xs text-muted-foreground">Loading…</span>
              )}
            </div>
            {distributionLabels.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No enrichment confidence data available yet.
              </p>
            ) : (
              <Bar
                data={{
                  labels: distributionLabels,
                  datasets: [
                    {
                      label: 'Contacts',
                      data: distributionValues,
                      backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    x: { grid: { display: false } },
                    y: { beginAtZero: true },
                  },
                }}
              />
            )}
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-sm p-6 space-y-3">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Cost & limits
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Daily tokens used</dt>
                <dd className="font-medium">
                  {system?.cost.daily_tokens_used ?? '—'} /{' '}
                  {system?.cost.daily_ai_token_cap ?? '—'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Monthly enrichments</dt>
                <dd className="font-medium">
                  {system?.cost.monthly_enrichments ?? '—'} /{' '}
                  {system?.cost.monthly_enrichment_cap ?? '—'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Enrichment failure rate</dt>
                <dd className="font-medium">
                  {system?.error_rates.enrichment_failure_rate != null
                    ? `${(system.error_rates.enrichment_failure_rate * 100).toFixed(1)}%`
                    : '—'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Retry queue size</dt>
                <dd className="font-medium">{overview?.retry_queue_size ?? system?.retry_queue_size ?? 0}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Total LLM cost (recent jobs)</dt>
                <dd className="font-medium tabular-nums">
                  {jobCostMetrics && jobCostMetrics.totalCost > 0
                    ? formatUsd(jobCostMetrics.totalCost)
                    : '—'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Avg extraction cost per website</dt>
                <dd className="font-medium tabular-nums">
                  {jobCostMetrics && jobCostMetrics.avgCostPerSite > 0
                    ? formatUsd(jobCostMetrics.avgCostPerSite)
                    : '—'}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
            ROI & capacity
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
              title="Websites scraped"
              value={jobCostMetrics?.totalUrls ?? 0}
              subtitle="Institutions processed across all jobs"
              icon={Database}
              color="from-blue-100 via-blue-200 to-blue-300"
            />
            <DashboardCard
              title="Enrichment rate"
              value={enrichmentRate}
              subtitle="Contacts meeting quality target"
              icon={Activity}
              color="from-emerald-100 via-emerald-200 to-emerald-300"
            />
            <DashboardCard
              title="Total scraping cost"
              value={
                jobCostMetrics && jobCostMetrics.totalCost > 0
                  ? formatUsd(jobCostMetrics.totalCost)
                  : '—'
              }
              subtitle="LLM cost across recent jobs"
              icon={TrendingUp}
              color="from-amber-100 via-amber-200 to-amber-300"
            />
            <DashboardCard
              title="Avg cost per website"
              value={
                jobCostMetrics && jobCostMetrics.avgCostPerSite > 0
                  ? formatUsd(jobCostMetrics.avgCostPerSite)
                  : '—'
              }
              subtitle="Extraction cost per institution"
              icon={Clock}
              color="from-slate-100 via-slate-200 to-slate-300"
            />
          </div>
        </section>

        <section className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Outreach by campaign
              </h2>
              <p className="text-xs text-muted-foreground">
                Generated vs sent messages per campaign.
              </p>
            </div>
          </div>
          {campaignMetrics.length === 0 ? (
            <p className="text-sm text-muted-foreground">No campaigns available yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-xs text-muted-foreground">
                    <th className="py-2 pr-4 text-left font-medium">Campaign</th>
                    <th className="py-2 px-4 text-right font-medium">Generated</th>
                    <th className="py-2 px-4 text-right font-medium">Sent</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignMetrics.map((row) => (
                    <tr key={row.name} className="border-b border-border/40 last:border-0">
                      <td className="py-2 pr-4">{row.name}</td>
                      <td className="py-2 px-4 text-right">{row.generated}</td>
                      <td className="py-2 px-4 text-right">{row.sent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

