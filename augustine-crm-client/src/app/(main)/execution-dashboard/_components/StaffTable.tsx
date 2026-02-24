'use client';

import { TableHeader } from '@/components/TableHeader';
import { Staff } from '@/types/execution';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { ExecutionStatusCard } from './ExecutionStatusCard';

const COLUMNS = [
  { label: 'Staff', align: 'left' as const },
  { label: 'Contact', align: 'left' as const },
  { label: 'Institution', align: 'left' as const },
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

export default function StaffTable({
  rows,
  isLoading,
  isError,
  onRetry,
  onInstitutionClick,
}: {
  rows: Staff[];
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
  /** When provided, institution name is shown as a link that calls this with institution_id. */
  onInstitutionClick?: (institutionId: number) => void;
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
                  Loading staff…
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
                  No staff found.
                </td>
              </tr>
            )}
            {!isLoading &&
              !isError &&
              rows.map((row) => (
                <tr key={row.staff_id} className="border-b border-border/50 hover:bg-muted/30 transition-colors align-top">
                  {/* Staff info */}
                  <td className="py-3 px-4 align-top">
                    <div className="flex flex-col gap-1.5">
                      <div className="text-base font-semibold text-foreground truncate">{cell(row.name)}</div>
                      {row.role && (
                        <div className="text-xs text-muted-foreground truncate">
                          {cell(row.role)}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Contact info */}
                  <td className="py-3 px-4 align-top">
                    <div className="flex flex-col gap-1.5 text-xs">
                      <div>
                        <span className="text-muted-foreground">Email</span>
                        <div className="text-sm text-foreground">
                          {row.email ? (
                            <a href={`mailto:${row.email}`} className="text-primary hover:underline">
                              {row.email}
                            </a>
                          ) : (
                            <span className="text-muted-foreground">Not available</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Contact</span>
                        <div className="text-sm text-foreground">
                          {row.contact_number ? cell(row.contact_number) : (
                            <span className="text-muted-foreground">Not available</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Institution link */}
                  <td className="py-3 px-4 align-top">
                    {row.institution_id != null ? (
                      onInstitutionClick ? (
                        <button
                          type="button"
                          onClick={() => onInstitutionClick(row.institution_id)}
                          className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                        >
                          {row.institutions?.name ?? `Institution #${row.institution_id}`}
                          <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 shrink-0" />
                        </button>
                      ) : (
                        <span className="text-muted-foreground">
                          {row.institutions?.name ?? `#${row.institution_id}`}
                        </span>
                      )
                    ) : (
                      <span className="text-muted-foreground">Not available</span>
                    )}
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

                  {/* Created */}
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
