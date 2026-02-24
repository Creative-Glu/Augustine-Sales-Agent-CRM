'use client';

import { TableHeader } from '@/components/TableHeader';
import type { Institution } from '@/types/execution';
import { ExecutionStatusCard } from './ExecutionStatusCard';

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

                  {/* Address */}
                  <td className="py-3 px-4 align-top">
                    <div className="max-w-xs text-sm text-foreground">
                      {row.address ? cell(row.address) : <span className="text-muted-foreground">Not available</span>}
                    </div>
                  </td>

                  {/* Status panel */}
                  <td className="py-3 px-4 align-top">
                    <div className="flex justify-end lg:justify-center">
                      <ExecutionStatusCard
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
