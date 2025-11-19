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
      <div className="p-6 bg-white rounded-lg shadow-md w-full h-96 flex items-center justify-center">
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
    <div className="p-6 bg-white rounded-lg shadow-md w-full">
      {/* Title */}
      <h2 className="text-xl font-bold mb-4 text-gray-800">Lead Journey Funnel</h2>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6">
        {STAGE_ORDER.map((stage) => (
          <div key={stage} className="flex items-center gap-2">
            <span className="w-4 h-4 rounded" style={{ backgroundColor: STAGE_COLORS[stage] }} />
            <span className="text-gray-700 text-sm">{stage}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="w-full h-96">
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 40, left: 100, bottom: 20 }}
          >
            <XAxis type="number" tick={{ fontSize: 12, fill: '#555' }} allowDecimals={false} />
            <YAxis type="category" dataKey="stage" tick={{ fontSize: 12, fill: '#555' }} />
            <Tooltip
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              formatter={(value: number) => {
                const percent = totalLeads ? ((value / totalLeads) * 100).toFixed(1) : 0;
                return `${value} leads (${percent}%)`;
              }}
            />
            <Bar dataKey="leads" isAnimationActive>
              <LabelList
                dataKey="leads"
                position="right"
                formatter={(value: any) =>
                  `${value} (${totalLeads ? ((value / totalLeads) * 100).toFixed(1) : 0}%)`
                }
              />
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LeadJourneyChart;
