'use client';

import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { STAGE_COLORS, STAGE_ORDER } from '@/constants/journey';
import { Journey } from '@/types/Journey';

interface JourneyChartsProps {
  journeys: Journey[];
}

const tooltipStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.97)',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
  fontSize: '13px',
};

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-slate-200/60 p-5 h-full flex flex-col">
      <div className="mb-3">
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex-1 min-h-[280px]">{children}</div>
    </div>
  );
}

export default function JourneyCharts({ journeys }: JourneyChartsProps) {
  // Stage distribution donut
  const donutData = useMemo(() => {
    const counts: Record<string, number> = {};
    journeys.forEach((j) => {
      counts[j.funnel_stage] = (counts[j.funnel_stage] || 0) + 1;
    });
    return STAGE_ORDER.filter((s) => counts[s]).map((s) => ({
      name: s,
      value: counts[s],
      fill: STAGE_COLORS[s] || '#94a3b8',
    }));
  }, [journeys]);

  // Leads over time (by last_interaction, last 30 days)
  const timeSeriesData = useMemo(() => {
    const days = 30;
    const buckets: Record<string, number> = {};
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      buckets[key] = 0;
    }
    journeys.forEach((j) => {
      const t = new Date(j.last_interaction);
      if (Number.isNaN(t.getTime())) return;
      const key = t.toISOString().slice(0, 10);
      if (key in buckets) buckets[key] += 1;
    });
    return Object.entries(buckets).map(([date, count]) => ({
      date: date.slice(5),
      count,
    }));
  }, [journeys]);

  // Stage-by-campaign stacked bar
  const { campaignBarData, activeStages } = useMemo(() => {
    const map: Record<string, { name: string; [stage: string]: string | number }> = {};
    journeys.forEach((j) => {
      const campaign = j.campaigns?.campaign_name || `Campaign #${j.campaign_id}`;
      if (!map[campaign]) {
        map[campaign] = { name: campaign };
      }
      const prev = (map[campaign][j.funnel_stage] as number | undefined) || 0;
      map[campaign][j.funnel_stage] = prev + 1;
    });
    const data = Object.values(map);
    const seen = new Set<string>();
    journeys.forEach((j) => seen.add(j.funnel_stage));
    const active = STAGE_ORDER.filter((s) => seen.has(s));
    return { campaignBarData: data, activeStages: active };
  }, [journeys]);

  const emptyState = (label: string) => (
    <div className="h-full flex items-center justify-center text-sm text-slate-400">{label}</div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      <ChartCard title="Stage Distribution" subtitle="Share of journeys by funnel stage">
        {donutData.length === 0 ? (
          emptyState('No data')
        ) : (
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={donutData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
              >
                {donutData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Activity (Last 30 Days)" subtitle="Last interactions per day">
        {journeys.length === 0 ? (
          emptyState('No data')
        ) : (
          <ResponsiveContainer>
            <LineChart data={timeSeriesData} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} interval={4} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#6366f1' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Stages by Campaign" subtitle="Funnel-stage breakdown per campaign">
        {campaignBarData.length === 0 ? (
          emptyState('No data')
        ) : (
          <ResponsiveContainer>
            <BarChart
              data={campaignBarData}
              margin={{ top: 10, right: 16, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#64748b' }}
                interval={0}
                angle={-15}
                textAnchor="end"
                height={50}
              />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              {activeStages.map((stage) => (
                <Bar
                  key={stage}
                  dataKey={stage}
                  stackId="campaigns"
                  fill={STAGE_COLORS[stage] || '#94a3b8'}
                  radius={[2, 2, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}
