'use client';

import { Header } from '@/components/Header';
import { useAugustineMetrics } from '@/services/augustine/useAugustineMetrics';
import DashboardCard from '@/app/(main)/dashboard/_components/DashboardCard';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { Activity, Database, Mail, TrendingUp, Clock, Users } from 'lucide-react';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function MarketingDashboardPage() {
  const { overview, system, roi, campaigns, isLoading, isError } = useAugustineMetrics();

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
      title: 'HubSpot synced',
      value: overview?.hubspot_synced ?? 0,
      subtitle: 'CRM-ready in HubSpot',
      icon: Mail,
      color: 'from-sky-100 via-sky-200 to-sky-300',
    },
    {
      title: 'Failed sync',
      value: overview?.failed_sync ?? 0,
      subtitle: 'Need attention',
      icon: TrendingUp,
      color: 'from-rose-100 via-rose-200 to-rose-300',
    },
  ];

  const roiCards = [
    {
      title: 'All-time hours saved',
      value: roi?.roi_estimates.total_hours_saved?.toFixed(1) ?? '0.0',
      subtitle: 'Manual work replaced by automation',
      icon: Clock,
      color: 'from-emerald-100 via-emerald-200 to-emerald-300',
    },
    {
      title: 'All-time FTE equivalent',
      value: roi?.roi_estimates.fte_equivalent?.toFixed(2) ?? '0.00',
      subtitle: 'Full-time roles worth of capacity',
      icon: Users,
      color: 'from-indigo-100 via-indigo-200 to-indigo-300',
    },
    {
      title: `Recent hours saved (${roi?.recent.days ?? 30}d)`,
      value: roi?.recent.estimated_hours_saved?.toFixed(1) ?? '0.0',
      subtitle: 'Last period across contacts + outreach',
      icon: Clock,
      color: 'from-amber-100 via-amber-200 to-amber-300',
    },
    {
      title: 'Avg hours to CRM-ready',
      value:
        roi?.flow.avg_hours_new_contact_to_crm_ready != null
          ? roi.flow.avg_hours_new_contact_to_crm_ready.toFixed(1)
          : '—',
      subtitle: 'From new lead to synced contact',
      icon: TrendingUp,
      color: 'from-slate-100 via-slate-200 to-slate-300',
    },
  ];

  const enrichmentDistribution = overview?.enrichment_confidence_distribution ?? {};
  const distributionLabels = Object.keys(enrichmentDistribution).sort();
  const distributionValues = distributionLabels.map((k) => enrichmentDistribution[k] ?? 0);

  const alerts = system?.alerts ?? [];

  const campaignMetrics = campaigns.map((c) => {
    const generated = overview?.outreach_generated_by_campaign?.[c.id] ?? 0;
    const sent = overview?.outreach_sent_by_campaign?.[c.id] ?? 0;
    return {
      name: c.name,
      generated,
      sent,
    };
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

        {alerts.length > 0 && (
          <div className="rounded-xl border border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
            <p className="font-medium mb-1">Alerts from pipeline</p>
            <ul className="list-disc list-inside space-y-0.5">
              {alerts.map((a, idx) => (
                <li key={idx}>
                  <span className="font-semibold">{a.type}</span> at{' '}
                  <span>{a.value}</span> (threshold {a.threshold})
                </li>
              ))}
            </ul>
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
                <dt className="text-muted-foreground">HubSpot failure rate</dt>
                <dd className="font-medium">
                  {system?.error_rates.hubspot_failure_rate != null
                    ? `${(system.error_rates.hubspot_failure_rate * 100).toFixed(1)}%`
                    : '—'}
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
            </dl>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
            ROI & capacity
          </h2>
          {!roi ? (
            <p className="text-sm text-muted-foreground">
              ROI metrics are not available yet. Once the backend calculates hours saved and FTE
              capacity, they will appear here.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {roiCards.map((stat) => (
                <DashboardCard key={stat.title} {...stat} />
              ))}
            </div>
          )}

          {roi && (
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6 space-y-3">
              <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                ROI assumptions
              </h3>
              <p className="text-xs text-muted-foreground">
                These are the constants the backend uses to convert automation into hours and FTE
                capacity. Business teams can tune them via environment variables.
              </p>
              <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="space-y-0.5">
                  <dt className="text-muted-foreground">Manual minutes per contact</dt>
                  <dd className="font-medium">
                    {roi.assumptions.manual_minutes_per_contact.toFixed(1)} min
                  </dd>
                </div>
                <div className="space-y-0.5">
                  <dt className="text-muted-foreground">Manual minutes per outreach</dt>
                  <dd className="font-medium">
                    {roi.assumptions.manual_minutes_per_outreach.toFixed(1)} min
                  </dd>
                </div>
                <div className="space-y-0.5">
                  <dt className="text-muted-foreground">FTE hours per week</dt>
                  <dd className="font-medium">
                    {roi.assumptions.fte_hours_per_week.toFixed(1)} h
                  </dd>
                </div>
                <div className="space-y-0.5">
                  <dt className="text-muted-foreground">Recent window</dt>
                  <dd className="font-medium">
                    Last {roi.assumptions.recent_days} days (configurable)
                  </dd>
                </div>
              </dl>
            </div>
          )}
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

