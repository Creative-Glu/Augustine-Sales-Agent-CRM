// 'use client';

// import { useState } from 'react';
// import { FunnelChart, Funnel, Tooltip, LabelList, ResponsiveContainer } from 'recharts';
// import { Skeleton } from '@/components/ui/skeleton';
// import { STAGE_ORDER } from '@/constants/journey';
// import { Journey } from '@/types/Journey';

// interface LeadJourneyDashboardProps {
//   journeys: Journey[];
//   isLoading: boolean;
// }

// export default function LeadJourneyDashboard({ journeys, isLoading }: LeadJourneyDashboardProps) {
//   const [expandedLeadIds, setExpandedLeadIds] = useState<number[]>([]);

//   if (isLoading) return <Skeleton className="h-96 w-full" />;

//   // Group journeys by lead
//   const leadsMap: Record<number, Journey[]> = {};
//   journeys.forEach((j: Journey) => {
//     if (!leadsMap[j.lead_id]) leadsMap[j.lead_id] = [];
//     leadsMap[j.lead_id].push(j);
//   });

//   // Count leads per stage for funnel chart
//   const stageCount: Record<string, number> = {};
//   journeys.forEach((j) => {
//     stageCount[j.funnel_stage] = (stageCount[j.funnel_stage] || 0) + 1;
//   });

//   const chartData = STAGE_ORDER.filter((stage) => stageCount[stage]).map((stage) => ({
//     stage,
//     leads: stageCount[stage],
//   }));

//   const toggleAccordion = (leadId: number) => {
//     setExpandedLeadIds((prev) =>
//       prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
//     );
//   };

//   return (
//     <div className="p-4 space-y-6">
//       <h1 className="text-3xl font-bold">Lead Journey Dashboard</h1>

//       {/* Funnel Chart */}
//       <div className="bg-white shadow rounded p-4">
//         <h2 className="text-xl font-semibold mb-2">Funnel Overview</h2>
//         <ResponsiveContainer width="100%" height={300}>
//           <FunnelChart>
//             <Tooltip />
//             <Funnel
//               dataKey="leads"
//               data={chartData}
//               isAnimationActive
//               nameKey="stage"
//               label={{ position: 'right', fill: '#000' }}
//             >
//               <LabelList position="right" fill="#000" stroke="none" dataKey="leads" />
//             </Funnel>
//           </FunnelChart>
//         </ResponsiveContainer>
//         <div className="mt-2 flex flex-wrap gap-2">
//           {STAGE_ORDER.map(
//             (stage) =>
//               stageCount[stage] && (
//                 <span key={stage} className="px-2 py-1 rounded bg-gray-100 text-sm font-medium">
//                   {stage}: {stageCount[stage]}
//                 </span>
//               )
//           )}
//         </div>
//       </div>

//       {/* Accordion Lead Cards */}
//       <div className="space-y-4">
//         {Object.values(leadsMap).map((leadJourneys) => {
//           const lead = leadJourneys[0];
//           const isExpanded = expandedLeadIds.includes(lead.lead_id);

//           return (
//             <div key={lead.lead_id} className="bg-white shadow rounded overflow-hidden">
//               <button
//                 onClick={() => toggleAccordion(lead.lead_id)}
//                 className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 focus:outline-none"
//               >
//                 <h3 className="text-lg font-semibold">{lead.campaign_test_group['Parish Name']}</h3>
//                 <span className="flex gap-1">
//                   {leadJourneys.map((j) => (
//                     <span
//                       key={j.journey_id}
//                       className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
//                     >
//                       {j.funnel_stage}
//                     </span>
//                   ))}
//                   <span className="ml-2 text-gray-500">{isExpanded ? '▲' : '▼'}</span>
//                 </span>
//               </button>

//               {isExpanded && (
//                 <div className="px-4 py-4 border-t border-gray-200 space-y-3">
//                   <p className="text-sm text-gray-500">
//                     Last Interaction:{' '}
//                     {new Date(
//                       leadJourneys[leadJourneys.length - 1].last_interaction
//                     ).toLocaleString()}
//                   </p>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//                     <div>
//                       <h4 className="font-medium">Lead Info</h4>
//                       <p>Email: {lead.campaign_test_group['Parish Contact Email']}</p>
//                       <p>Phone: {lead.campaign_test_group['Parish Phone']}</p>
//                       <p>Formed Status: {lead.campaign_test_group['Formed Status']}</p>
//                     </div>
//                     <div>
//                       <h4 className="font-medium">Campaigns</h4>
//                       {leadJourneys.map((j) => (
//                         <div key={j.journey_id} className="mb-2">
//                           <p className="font-medium">{j.campaigns.campaign_name}</p>
//                           <p>Status: {j.campaigns.campaign_status}</p>
//                           <p className="text-gray-700 text-sm">{j.campaigns.instructions}</p>
//                         </div>
//                       ))}
//                     </div>
//                   </div>

//                   <div>
//                     <h4 className="font-medium">Notes</h4>
//                     {leadJourneys.map((j) => (
//                       <p
//                         key={j.journey_id}
//                         className="text-gray-700 text-sm whitespace-pre-wrap mb-2"
//                       >
//                         {j.notes}
//                       </p>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 md:p-8">
      <div className="">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Funnel Overview
          </h1>
          <p className="text-slate-600 text-lg">
            Track and manage your lead progression through the funnel
          </p>
        </div>

        {/* Funnel Chart */}
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-6 md:p-8 border border-slate-200/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Funnel Overview</h2>
            <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-sm font-semibold shadow-lg">
              {journeys.length} Total Leads
            </div>
          </div>

          <ResponsiveContainer width="100%" height={320}>
            <FunnelChart>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                }}
              />
              <Funnel
                dataKey="leads"
                data={chartData}
                isAnimationActive
                nameKey="stage"
                label={{ position: 'right', fill: '#1e293b', fontWeight: 600 }}
              >
                <LabelList
                  position="right"
                  fill="#1e293b"
                  stroke="none"
                  dataKey="leads"
                  fontWeight={700}
                />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>

          <div className="mt-6 flex flex-wrap gap-3">
            {STAGE_ORDER.map(
              (stage) =>
                stageCount[stage] && (
                  <div
                    key={stage}
                    className="group px-4 py-2 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">
                      {stage}
                    </span>
                    <span className="ml-2 px-2 py-1 bg-white rounded-full text-xs font-bold text-indigo-600">
                      {stageCount[stage]}
                    </span>
                  </div>
                )
            )}
          </div>
        </div>

        {/* Accordion Lead Cards */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Lead Details</h2>

          {Object.values(leadsMap).map((leadJourneys) => {
            const lead = leadJourneys[0];
            const isExpanded = expandedLeadIds.includes(lead.lead_id);

            return (
              <div
                key={lead.lead_id}
                className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden border border-slate-200/50 hover:shadow-2xl transition-all duration-300"
              >
                <button
                  onClick={() => toggleAccordion(lead.lead_id)}
                  className="w-full flex justify-between items-center px-6 py-5 bg-gradient-to-r from-slate-50 to-blue-50 hover:from-blue-50 hover:to-indigo-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {lead.campaign_test_group['Parish Name']?.charAt(0) || 'L'}
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">
                      {lead.campaign_test_group['Parish Name']}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex gap-2 flex-wrap justify-end">
                      {leadJourneys.map((j) => (
                        <span
                          key={j.journey_id}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                        >
                          {j.funnel_stage}
                        </span>
                      ))}
                    </div>
                    <div
                      className={`ml-4 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-6 py-6 border-t border-slate-200 bg-white space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Last Interaction */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                      <svg
                        className="w-5 h-5 text-amber-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-sm font-medium text-slate-700">
                        Last Interaction:{' '}
                        <span className="font-bold text-slate-900">
                          {new Date(
                            leadJourneys[leadJourneys.length - 1].last_interaction
                          ).toLocaleString()}
                        </span>
                      </p>
                    </div>

                    {/* Lead Info Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Lead Info Card */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                          <svg
                            className="w-5 h-5 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <h4 className="font-bold text-lg text-slate-800">Lead Information</h4>
                        </div>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-start gap-2">
                            <svg
                              className="w-4 h-4 text-slate-500 mt-0.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            <div>
                              <span className="text-slate-600 font-medium">Email:</span>
                              <p className="text-slate-900 font-semibold">
                                {lead.campaign_test_group['Parish Contact Email']}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <svg
                              className="w-4 h-4 text-slate-500 mt-0.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                            <div>
                              <span className="text-slate-600 font-medium">Phone:</span>
                              <p className="text-slate-900 font-semibold">
                                {lead.campaign_test_group['Parish Phone']}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <svg
                              className="w-4 h-4 text-slate-500 mt-0.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <div>
                              <span className="text-slate-600 font-medium">Formed Status:</span>
                              <p className="text-slate-900 font-semibold">
                                {lead.campaign_test_group['Formed Status']}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Campaigns Card */}
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                          <svg
                            className="w-5 h-5 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                          <h4 className="font-bold text-lg text-slate-800">Campaigns</h4>
                        </div>
                        <div className="space-y-4">
                          {leadJourneys.map((j) => (
                            <div
                              key={j.journey_id}
                              className="bg-white rounded-lg p-4 shadow-sm border border-purple-100"
                            >
                              <p className="font-bold text-slate-900 mb-2">
                                {j.campaigns.campaign_name}
                              </p>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-semibold">
                                  {j.campaigns.campaign_status}
                                </span>
                              </div>
                              <p className="text-slate-600 text-sm leading-relaxed">
                                {j.campaigns.instructions}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Notes Section */}
                    <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-5 border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <svg
                          className="w-5 h-5 text-slate-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        <h4 className="font-bold text-lg text-slate-800">Notes</h4>
                      </div>
                      <div className="space-y-3">
                        {leadJourneys.map((j) => (
                          <div
                            key={j.journey_id}
                            className="bg-white rounded-lg p-4 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap shadow-sm border border-slate-200"
                          >
                            {j.notes}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
