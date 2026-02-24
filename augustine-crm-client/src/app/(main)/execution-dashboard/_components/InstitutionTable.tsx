'use client';

import { useState, Fragment, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TableHeader } from '@/components/TableHeader';
import type { Institution } from '@/types/execution';
import { ExecutionStatusPipelinePanel } from './ExecutionStatusPipelinePanel';
import { Badge } from '@/components/ui/badge';
import type { SyncStatus } from '@/types/execution';

const COLUMNS = [
  { label: 'Institution', align: 'left' as const },
  { label: 'Contact', align: 'left' as const },
  { label: 'Address', align: 'left' as const },
  { label: 'Status', align: 'left' as const },
  { label: 'Created', align: 'left' as const },
];

function cell(value: string | null | undefined): string {
  return value ?? '—';
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function smallSyncBadge(status: SyncStatus | null | undefined) {
  if (!status) {
    return <span className="text-xs text-muted-foreground">Sync: Not available</span>;
  }
  let className =
    'border-border/60 bg-muted text-muted-foreground';
  if (status === 'success') {
    className = 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
  } else if (status === 'failed') {
    className = 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400';
  }
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <span>Sync:</span>
      <Badge variant="outline" className={`h-5 px-2 text-[11px] font-medium border ${className}`}>
        {status}
      </Badge>
    </span>
  );
}

export default function InstitutionTable({
  rows,
  isLoading,
  isError,
  onRetry,
  onSelect,
}: {
  rows: Institution[];
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
  onSelect?: (institution: Institution) => void;
}) {
  const colSpan = COLUMNS.length;
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const [panelAnchor, setPanelAnchor] = useState<{ top: number; left: number } | null>(null);

  const PANEL_WIDTH = 280;
  const PANEL_EST_HEIGHT = 300;
  const GAP = 4;
  const MARGIN = 12;

  const openPanel = (rowId: string | number, event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - MARGIN;
    const openAbove = spaceBelow < PANEL_EST_HEIGHT;
    let top = openAbove
      ? rect.top - PANEL_EST_HEIGHT - GAP
      : rect.bottom + GAP;
    if (openAbove) top = Math.max(8, top);
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - PANEL_WIDTH - MARGIN));
    setExpandedId(rowId);
    setPanelAnchor({ top, left });
  };

  const closePanel = () => {
    setExpandedId(null);
    setPanelAnchor(null);
  };

  useEffect(() => {
    if (!expandedId) return;
    const onScroll = () => closePanel();
    window.addEventListener('scroll', onScroll, true);
    return () => window.removeEventListener('scroll', onScroll, true);
  }, [expandedId]);

  const expandedRow = expandedId != null ? rows.find((r) => r.id === expandedId) : null;

  return (
    <>
    <div className="w-full rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <TableHeader columns={COLUMNS} />
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={colSpan} className="py-12 text-center text-muted-foreground text-sm">
                  Loading institutions…
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={colSpan} className="py-12 text-center text-destructive text-sm">
                  Failed to load.{' '}
                  {onRetry && (
                    <button type="button" onClick={onRetry} className="underline font-medium ml-1 hover:no-underline">
                      Retry
                    </button>
                  )}
                </td>
              </tr>
            )}
            {!isLoading && !isError && rows.length === 0 && (
              <tr>
                <td colSpan={colSpan} className="py-12 text-center text-muted-foreground text-sm">
                  No institutions found.
                </td>
              </tr>
            )}
            {!isLoading &&
              !isError &&
              rows.map((row) => (
                <Fragment key={row.id}>
                  <tr
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer align-top"
                    onClick={() => onSelect?.(row)}
                  >
                    {/* Institution info block */}
                    <td className="py-3 px-4 align-top">
                    <div className="flex flex-col gap-1.5">
                      <div className="text-base font-semibold text-foreground truncate">{cell(row.name)}</div>
                      {row.website_url && (
                        <a
                          href={row.website_url.startsWith('http') ? row.website_url : `https://${row.website_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline truncate max-w-[220px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {row.website_url}
                        </a>
                      )}
                      {row.type && (
                        <span className="text-xs text-muted-foreground">
                          {row.type}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Email + contact number (institution has contact stored as contact number) */}
                  <td className="py-3 px-4 align-top">
                    <div className="flex flex-col gap-1.5 text-xs">
                      <div>
                        <span className="text-muted-foreground">Email</span>
                        <div className="text-sm text-foreground">
                          {row.email ? cell(row.email) : <span className="text-muted-foreground">Not available</span>}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Contact number</span>
                        <div className="text-sm text-foreground">
                          {row.contact ? cell(row.contact) : (
                            <span className="text-muted-foreground">Not available</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Address – fixed min width so address wraps in readable chunks, not one word per line */}
                  <td className="py-3 px-4 align-top" style={{ minWidth: '220px' }}>
                    <div className="text-sm text-foreground break-words" title={row.address ?? undefined}>
                      {row.address ? cell(row.address) : <span className="text-muted-foreground">Not available</span>}
                    </div>
                  </td>

                  {/* Status – click opens panel above or below */}
                  <td className="py-3 px-4 align-top" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-col items-start gap-1.5">
                      {smallSyncBadge(row.sync_status ?? null)}
                      <button
                        type="button"
                        onClick={(e) => (expandedId === row.id ? closePanel() : openPanel(row.id, e))}
                        className="text-xs text-primary hover:underline underline-offset-2 text-left"
                      >
                        {expandedId === row.id ? 'Hide sync pipeline' : 'View sync pipeline'}
                      </button>
                    </div>
                  </td>

                  {/* Created date */}
                  <td className="py-3 px-4 text-muted-foreground align-top whitespace-nowrap">
                    {formatDate(row.created_at)}
                  </td>
                </tr>
                </Fragment>
              ))}
          </tbody>
        </table>
      </div>
    </div>
    {expandedRow && panelAnchor && typeof document !== 'undefined' && createPortal(
      <>
        <div
          className="fixed inset-0 z-40"
          aria-hidden
          onClick={closePanel}
        />
        <div
          className="z-50"
          style={{ position: 'fixed', top: panelAnchor.top, left: panelAnchor.left }}
          onClick={(e) => e.stopPropagation()}
        >
          <ExecutionStatusPipelinePanel
            entityLabel={expandedRow.name}
            enrichmentConfidence={expandedRow.enrichment_confidence ?? null}
            isEligible={expandedRow.is_eligible ?? null}
            syncedToHubspot={expandedRow.synced_to_hubspot ?? null}
            syncStatus={expandedRow.sync_status ?? null}
            webhookStatus={expandedRow.webhook_status ?? null}
            lastSyncedAt={expandedRow.last_synced_at ?? null}
            onClose={closePanel}
          />
        </div>
      </>,
      document.body
    )}
    </>
  );
}
