'use client';

import { TableHeader } from '@/components/TableHeader';
import { SyncStatusBadges } from '@/app/(main)/execution-dashboard/_components/SyncStatusBadges';
import type { Institution } from '@/types/execution';

const COLUMNS = [
  { label: 'Name', align: 'left' as const },
  { label: 'Email', align: 'left' as const },
  { label: 'Contact', align: 'left' as const },
  { label: 'Website', align: 'left' as const },
  { label: 'Address', align: 'left' as const },
  { label: 'Type', align: 'left' as const },
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
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => onSelect?.(row)}
                >
                  <td className="py-3 px-4 font-medium text-foreground">
                    <div className="flex flex-col gap-1">
                      <span>{cell(row.name)}</span>
                      {row.synced_to_hubspot === true && (
                        <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                          <span className="text-xs text-muted-foreground font-medium">Managed in HubSpot</span>
                          {row.hubspot_company_id && process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID ? (
                            <a
                              href={`https://app.hubspot.com/contacts/${process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID}/company/${row.hubspot_company_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline"
                            >
                              Open in HubSpot
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground">Open in HubSpot (set portal ID)</span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{cell(row.email)}</td>
                  <td className="py-3 px-4 text-muted-foreground">{cell(row.contact)}</td>
                  <td className="py-3 px-4">
                    {row.website_url ? (
                      <a
                        href={row.website_url.startsWith('http') ? row.website_url : `https://${row.website_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline truncate max-w-[180px] inline-block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {row.website_url}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground max-w-[200px] truncate">
                    {cell(row.address)}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{cell(row.type)}</td>
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
                  <td className="py-3 px-4 text-muted-foreground">
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
