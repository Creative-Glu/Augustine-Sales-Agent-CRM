'use client';

import { Fragment, useState } from 'react';
import { ChevronDown, ChevronUp, Mail, Phone, MapPin } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { STAGE_COLORS } from '@/constants/journey';
import { Journey } from '@/types/Journey';
import { ViewButton } from '@/components/ActionButtons';
import JourneyViewModal from './JourneyViewModal';

interface JourneyTableProps {
  journeys: Journey[];
  total: number;
  offset: number;
  limit: number;
  isLoading: boolean;
  isError: boolean;
}

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function JourneyTable({
  journeys,
  total,
  offset,
  limit,
  isLoading,
  isError,
}: JourneyTableProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [viewing, setViewing] = useState<Journey | null>(null);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => (prev === id ? null : id));
  };

  const rangeStart = total === 0 ? 0 : offset + 1;
  const rangeEnd = Math.min(offset + journeys.length, total);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-slate-200/60 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Journeys</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {total === 0
              ? 'No records'
              : `Showing ${rangeStart}–${rangeEnd} of ${total}`}
          </p>
        </div>
      </div>

      <Table className="text-sm">
        <TableHeader>
          <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
            <TableHead className="w-8" />
            <TableHead>Parish / Diocese</TableHead>
            <TableHead>Campaign</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Institution</TableHead>
            <TableHead>Last Interaction</TableHead>
            <TableHead className="w-16 text-center">Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={7} className="py-6">
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              </TableCell>
            </TableRow>
          )}

          {!isLoading && isError && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12 text-rose-500">
                Failed to load journeys. Please try again.
              </TableCell>
            </TableRow>
          )}

          {!isLoading && !isError && journeys.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                No journeys match the current filters.
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            !isError &&
            journeys.map((j) => {
              const isOpen = expanded === j.journey_id;
              const stageColor = STAGE_COLORS[j.funnel_stage] || '#94a3b8';
              const parishName = j.lead?.['Parish Name'] || '—';
              const diocese = j.lead?.['Diocese/Archdiocese Name'];
              const email = j.lead?.['Parish Contact Email'];
              const phone = j.lead?.['Parish Phone'];

              return (
                <Fragment key={j.journey_id}>
                  <TableRow
                    onClick={() => toggleExpand(j.journey_id)}
                    className="cursor-pointer"
                  >
                    <TableCell>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900">{parishName}</div>
                      {diocese && (
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {diocese}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-slate-800">
                        {j.campaigns?.campaign_name || `Campaign #${j.campaign_id}`}
                      </div>
                      {j.campaigns?.campaign_status && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          {j.campaigns.campaign_status}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className="font-semibold text-white border-0"
                        style={{ backgroundColor: stageColor }}
                      >
                        {j.funnel_stage}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-700">
                      {j.lead?.['Institution Type'] || '—'}
                    </TableCell>
                    <TableCell className="text-slate-700 text-xs">
                      {formatDate(j.last_interaction)}
                    </TableCell>
                    <TableCell
                      className="text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ViewButton onClick={() => setViewing(j)} />
                    </TableCell>
                  </TableRow>

                  {isOpen && (
                    <TableRow className="bg-slate-50/40 hover:bg-slate-50/40">
                      <TableCell colSpan={7} className="p-0">
                        <div className="p-5 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div className="bg-white rounded-lg border border-slate-200 p-3">
                              <p className="font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                Contact
                              </p>
                              <div className="space-y-1.5 text-slate-700">
                                {email && (
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                                    <a
                                      href={`mailto:${email}`}
                                      className="hover:text-indigo-600 truncate"
                                    >
                                      {email}
                                    </a>
                                  </div>
                                )}
                                {phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{phone}</span>
                                  </div>
                                )}
                                {!email && !phone && (
                                  <span className="text-slate-400">—</span>
                                )}
                              </div>
                            </div>

                            <div className="bg-white rounded-lg border border-slate-200 p-3">
                              <p className="font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                Lead Attributes
                              </p>
                              <dl className="space-y-1 text-slate-700">
                                <div className="flex justify-between gap-2">
                                  <dt className="text-slate-500">Formed Status</dt>
                                  <dd>{j.lead?.['Formed Status'] || '—'}</dd>
                                </div>
                                <div className="flex justify-between gap-2">
                                  <dt className="text-slate-500">Classification</dt>
                                  <dd>{j.lead?.Classification || '—'}</dd>
                                </div>
                                <div className="flex justify-between gap-2">
                                  <dt className="text-slate-500">Tech Readiness</dt>
                                  <dd>{j.lead?.['Technology Readiness'] || '—'}</dd>
                                </div>
                              </dl>
                            </div>

                            <div className="bg-white rounded-lg border border-slate-200 p-3">
                              <p className="font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                Campaign
                              </p>
                              <div className="space-y-1 text-slate-700">
                                <div className="font-medium">
                                  {j.campaigns?.campaign_name || '—'}
                                </div>
                                {j.campaigns?.instructions && (
                                  <p className="text-slate-600 leading-relaxed line-clamp-3">
                                    {j.campaigns.instructions}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {j.notes && (
                            <div className="bg-white rounded-lg border border-slate-200 p-3">
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                Notes
                              </p>
                              <pre className="whitespace-pre-wrap font-sans text-xs text-slate-700 leading-relaxed max-h-72 overflow-y-auto">
                                {j.notes}
                              </pre>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
        </TableBody>
      </Table>

      <JourneyViewModal
        open={!!viewing}
        onClose={() => setViewing(null)}
        journey={viewing}
      />
    </div>
  );
}
