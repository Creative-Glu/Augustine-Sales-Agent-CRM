'use client';

import { useState } from 'react';
import { FunnelChart, Funnel, Tooltip, LabelList, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { STAGE_ORDER } from '@/constants/journey';
import { Journey } from '@/types/Journey';

interface LeadJourneyDashboardProps {
  journeys: Journey[];
  isLoading: boolean;
}

export default function LeadJourneyDashboard({ journeys, isLoading }: LeadJourneyDashboardProps) {
  const [expandedLeadIds, setExpandedLeadIds] = useState<number[]>([]);

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  // Group journeys by lead
  const leadsMap: Record<number, Journey[]> = {};
  journeys.forEach((j: Journey) => {
    if (!leadsMap[j.lead_id]) leadsMap[j.lead_id] = [];
    leadsMap[j.lead_id].push(j);
  });

  // Count leads per stage for funnel chart
  const stageCount: Record<string, number> = {};
  journeys.forEach((j) => {
    stageCount[j.funnel_stage] = (stageCount[j.funnel_stage] || 0) + 1;
  });

  const chartData = STAGE_ORDER.filter((stage) => stageCount[stage]).map((stage) => ({
    stage,
    leads: stageCount[stage],
  }));

  const toggleAccordion = (leadId: number) => {
    setExpandedLeadIds((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-3xl font-bold">Lead Journey Dashboard</h1>

      {/* Funnel Chart */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-xl font-semibold mb-2">Funnel Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <FunnelChart>
            <Tooltip />
            <Funnel
              dataKey="leads"
              data={chartData}
              isAnimationActive
              nameKey="stage"
              label={{ position: 'right', fill: '#000' }}
            >
              <LabelList position="right" fill="#000" stroke="none" dataKey="leads" />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
        <div className="mt-2 flex flex-wrap gap-2">
          {STAGE_ORDER.map(
            (stage) =>
              stageCount[stage] && (
                <span key={stage} className="px-2 py-1 rounded bg-gray-100 text-sm font-medium">
                  {stage}: {stageCount[stage]}
                </span>
              )
          )}
        </div>
      </div>

      {/* Accordion Lead Cards */}
      <div className="space-y-4">
        {Object.values(leadsMap).map((leadJourneys) => {
          const lead = leadJourneys[0];
          const isExpanded = expandedLeadIds.includes(lead.lead_id);

          return (
            <div key={lead.lead_id} className="bg-white shadow rounded overflow-hidden">
              <button
                onClick={() => toggleAccordion(lead.lead_id)}
                className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 focus:outline-none"
              >
                <h3 className="text-lg font-semibold">{lead.campaign_test_group['Parish Name']}</h3>
                <span className="flex gap-1">
                  {leadJourneys.map((j) => (
                    <span
                      key={j.journey_id}
                      className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {j.funnel_stage}
                    </span>
                  ))}
                  <span className="ml-2 text-gray-500">{isExpanded ? '▲' : '▼'}</span>
                </span>
              </button>

              {isExpanded && (
                <div className="px-4 py-4 border-t border-gray-200 space-y-3">
                  <p className="text-sm text-gray-500">
                    Last Interaction:{' '}
                    {new Date(
                      leadJourneys[leadJourneys.length - 1].last_interaction
                    ).toLocaleString()}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium">Lead Info</h4>
                      <p>Email: {lead.campaign_test_group['Parish Contact Email']}</p>
                      <p>Phone: {lead.campaign_test_group['Parish Phone']}</p>
                      <p>Formed Status: {lead.campaign_test_group['Formed Status']}</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Campaigns</h4>
                      {leadJourneys.map((j) => (
                        <div key={j.journey_id} className="mb-2">
                          <p className="font-medium">{j.campaigns.campaign_name}</p>
                          <p>Status: {j.campaigns.campaign_status}</p>
                          <p className="text-gray-700 text-sm">{j.campaigns.instructions}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium">Notes</h4>
                    {leadJourneys.map((j) => (
                      <p
                        key={j.journey_id}
                        className="text-gray-700 text-sm whitespace-pre-wrap mb-2"
                      >
                        {j.notes}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
