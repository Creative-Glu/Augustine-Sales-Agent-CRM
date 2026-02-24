'use client';

import { TableHeader } from '@/components/TableHeader';
import { SyncStatusBadges } from '@/app/(main)/execution-dashboard/_components/SyncStatusBadges';
import { Staff } from '@/types/execution';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

const COLUMNS = [
  { label: 'Name', align: 'left' as const },
  { label: 'Role', align: 'left' as const },
  { label: 'Email', align: 'left' as const },
  { label: 'Contact number', align: 'left' as const },
  { label: 'Institution', align: 'left' as const },
  { label: 'Sync status', align: 'left' as const },
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
                <tr key={row.staff_id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-medium text-foreground">
                    <div className="flex flex-col gap-1">
                      <span>{cell(row.name)}</span>
                      {row.synced_to_hubspot === true && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-muted-foreground font-medium">Managed in HubSpot</span>
                          {row.hubspot_contact_id && process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID && (
                            <a
                              href={`https://app.hubspot.com/contacts/${process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID}/contact/${row.hubspot_contact_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline"
                            >
                              Open in HubSpot
                            </a>
                          )}
                          {row.synced_to_hubspot === true && (!row.hubspot_contact_id || !process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID) && (
                            <span className="text-xs text-muted-foreground">Open in HubSpot (set portal ID)</span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{cell(row.role)}</td>
                  <td className="py-3 px-4">
                    {row.email ? (
                      <a href={`mailto:${row.email}`} className="text-primary hover:underline">
                        {row.email}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{cell(row.contact_number)}</td>
                  <td className="py-3 px-4">
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
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <SyncStatusBadges
                      enrichmentConfidence={row.enrichment_confidence}
                      isEligible={row.is_eligible}
                      syncedToHubspot={row.synced_to_hubspot}
                      syncStatus={row.sync_status ?? undefined}
                      webhookStatus={row.webhook_status}
                      lastSyncedAt={row.last_synced_at}
                    />
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{formatDate(row.created_at)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
