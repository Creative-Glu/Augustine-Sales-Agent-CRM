'use client';

import { useKPIDashboard } from '@/services/kpi/usekpi';
import { SingleValueCard } from './SingleValueCard';
import { FunnelStageChart } from './StackedBarChart';
import { FunnelChartData, FunnelStage } from '@/types/kpi';

export const KPIDashboard = () => {
  const { data, isLoading, error } = useKPIDashboard();

  if (isLoading) return <div className="text-black p-6">Loading KPI dashboard...</div>;
  if (error) return <div className="text-black p-6">Error loading KPI data</div>;
  if (!data) return <div className="text-black p-6">No KPI data available</div>;

  const {
    funnel_stage_data = [],
    cta_clicked = { sal_count: 0, outreached_count: 0, conversion_rate_pct: 0 },
    conversion_rate = { won_count: 0, outreached_count: 0, conversion_rate_pct: 0 },
  } = data;

  // Compute totals from funnel stage data
  const totalLeadsReached = funnel_stage_data.reduce(
    (sum: number, stage: FunnelStage) => sum + stage.leads_reached,
    0
  );
  const totalStageOccurrences = funnel_stage_data.reduce(
    (sum: number, stage: FunnelStage) => sum + stage.stage_occurrences,
    0
  );
  const totalLogEvents = funnel_stage_data.reduce(
    (sum: number, stage: FunnelStage) => sum + stage.log_events,
    0
  );

  const {
    sal_count: ctaSalCount,
    outreached_count: ctaOutreached,
    conversion_rate_pct: ctaConversionRate,
  } = cta_clicked;
  const {
    won_count: conversionWonCount,
    outreached_count: conversionOutreached,
    conversion_rate_pct: conversionRatePct,
  } = conversion_rate;

  // Prepare chart data
  const chartData: FunnelChartData[] = funnel_stage_data.map((stage: FunnelStage) => ({
    stage: stage.funnel_stage,
    leadsReached: stage.leads_reached,
    stageOccurrences: stage.stage_occurrences,
    avgHours: stage.avg_hours,
  }));

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white grid gap-6">
      {/* Top row metrics */}
      <div className="grid grid-cols-3 gap-4">
        <SingleValueCard title="Total Leads Reached" value={totalLeadsReached} />
        <SingleValueCard title="Total Stage Occurrences" value={totalStageOccurrences} />
        <SingleValueCard title="Total Log Events" value={totalLogEvents} />
      </div>

      {/* CTA metrics */}
      <div className="grid grid-cols-3 gap-4">
        <SingleValueCard title="CTA SAL Count" value={ctaSalCount} />
        <SingleValueCard title="CTA Outreached" value={ctaOutreached} />
        <SingleValueCard title="CTA Conversion %" value={ctaConversionRate} />
      </div>

      {/* Conversion metrics */}
      <div className="grid grid-cols-3 gap-4">
        <SingleValueCard title="Conversion Won Count" value={conversionWonCount} />
        <SingleValueCard title="Conversion Outreached" value={conversionOutreached} />
        <SingleValueCard title="Conversion Rate %" value={conversionRatePct} />
      </div>

      {/* Funnel Stage Chart */}
      <div className="bg-gray-800 p-4 rounded shadow">
        <h2 className="text-lg mb-2">Funnel Stage Analytics</h2>
        {chartData.length > 0 ? (
          <FunnelStageChart data={chartData} />
        ) : (
          <div>No chart data available</div>
        )}
      </div>
    </div>
  );
};
