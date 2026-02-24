'use client';

import { TableHeader } from '@/components/TableHeader';
import type { Institution } from '@/types/execution';
import { ExecutionStatusDialog } from './ExecutionStatusDialog';
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

  return (
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
                <tr
                  key={row.id}
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

                  {/* Contact / email */}
                  <td className="py-3 px-4 align-top">
                    <div className="flex flex-col gap-1.5 text-xs">
                      <div>
                        <span className="text-muted-foreground">Email</span>
                        <div className="text-sm text-foreground">
                          {row.email ? cell(row.email) : <span className="text-muted-foreground">Not available</span>}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Contact</span>
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

                  {/* Status panel – stop propagation so row click doesn't open staff modal */}
                  <td className="py-3 px-4 align-top" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-col items-start gap-1.5">
                      {smallSyncBadge(row.sync_status ?? null)}
                      <ExecutionStatusDialog
                        entityLabel={row.name}
                        enrichmentConfidence={row.enrichment_confidence ?? null}
                        isEligible={row.is_eligible ?? null}
                        syncedToHubspot={row.synced_to_hubspot ?? null}
                        syncStatus={row.sync_status ?? null}
                        webhookStatus={row.webhook_status ?? null}
                        lastSyncedAt={row.last_synced_at ?? null}
                      />
                    </div>
                  </td>

                  {/* Created date */}
                  <td className="py-3 px-4 text-muted-foreground align-top whitespace-nowrap">
                    {formatDate(row.created_at)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
