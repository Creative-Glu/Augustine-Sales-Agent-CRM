'use client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { STAGE_COLORS, STAGE_ORDER } from '@/constants/journey';
import { Journey } from '@/types/Journey';

interface LeadJourneyChartProps {
  journeys: Journey[];
  isLoading: boolean;
}

const LeadJourneyChart = ({ journeys, isLoading }: LeadJourneyChartProps) => {
  if (isLoading) {
    return (
      <div className="p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 w-full h-96 flex items-center justify-center">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  // Count leads per stage
  const stageCount: Record<string, number> = {};
  journeys.forEach((lead) => {
    stageCount[lead.funnel_stage] = (stageCount[lead.funnel_stage] || 0) + 1;
  });

  // Prepare chart data in order
  const chartData = STAGE_ORDER.map((stage) => ({
    stage,
    leads: stageCount[stage] || 0,
    fill: STAGE_COLORS[stage],
  }));

  const totalLeads = chartData.reduce((acc, item) => acc + item.leads, 0);

  return (
    <div className="p-6 md:p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 w-full hover:shadow-2xl transition-all duration-300">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Lead Journey Funnel
          </h2>
          <p className="text-slate-600 text-sm">Visual breakdown of leads across funnel stages</p>
        </div>
        <div className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-sm font-bold shadow-lg">
          {totalLeads} Total
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-8 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
        {STAGE_ORDER.map((stage) => (
          <div
            key={stage}
            className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <span
              className="w-4 h-4 rounded-md shadow-sm"
              style={{ backgroundColor: STAGE_COLORS[stage] }}
            />
            <span className="text-slate-700 text-sm font-semibold">{stage}</span>
            <span className="text-xs text-slate-500 font-medium">({stageCount[stage] || 0})</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="w-full h-96 bg-gradient-to-br from-slate-50/50 to-blue-50/50 rounded-xl p-4 border border-slate-100">
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 50, left: 120, bottom: 20 }}
          >
            <XAxis
              type="number"
              tick={{ fontSize: 13, fill: '#475569', fontWeight: 600 }}
              allowDecimals={false}
              stroke="#cbd5e1"
              strokeWidth={2}
            />
            <YAxis
              type="category"
              dataKey="stage"
              tick={{ fontSize: 13, fill: '#1e293b', fontWeight: 600 }}
              stroke="#cbd5e1"
              strokeWidth={2}
            />
            <Tooltip
              cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                padding: '12px 16px',
              }}
              labelStyle={{
                color: '#1e293b',
                fontWeight: 700,
                fontSize: '14px',
                marginBottom: '4px',
              }}
              itemStyle={{
                color: '#475569',
                fontSize: '13px',
                fontWeight: 600,
              }}
              formatter={(value: number) => {
                const percent = totalLeads ? ((value / totalLeads) * 100).toFixed(1) : 0;
                return [`${value} leads (${percent}%)`, 'Count'];
              }}
            />
            <Bar dataKey="leads" isAnimationActive radius={[0, 8, 8, 0]} animationDuration={800}>
              <LabelList
                dataKey="leads"
                position="right"
                style={{
                  fill: '#1e293b',
                  fontWeight: 700,
                  fontSize: '13px',
                }}
                formatter={(value: any) =>
                  `${value} (${totalLeads ? ((value / totalLeads) * 100).toFixed(1) : 0}%)`
                }
              />
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Summary */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 shadow-sm">
          <p className="text-xs text-slate-600 font-semibold mb-1">Total Stages</p>
          <p className="text-2xl font-bold text-slate-800">{STAGE_ORDER.length}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200 shadow-sm">
          <p className="text-xs text-slate-600 font-semibold mb-1">Active Stages</p>
          <p className="text-2xl font-bold text-slate-800">{Object.keys(stageCount).length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 shadow-sm">
          <p className="text-xs text-slate-600 font-semibold mb-1">Avg per Stage</p>
          <p className="text-2xl font-bold text-slate-800">
            {Object.keys(stageCount).length > 0
              ? Math.round(totalLeads / Object.keys(stageCount).length)
              : 0}
          </p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200 shadow-sm">
          <p className="text-xs text-slate-600 font-semibold mb-1">Top Stage</p>
          <p className="text-2xl font-bold text-slate-800">
            {chartData.reduce((max, item) => (item.leads > max.leads ? item : max), chartData[0])
              ?.leads || 0}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LeadJourneyChart;
