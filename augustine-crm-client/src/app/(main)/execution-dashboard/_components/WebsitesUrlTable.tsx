'use client';

import { TableHeader } from '@/components/TableHeader';
import { WebsitesUrl } from '@/types/websitesUrl';
import { getStateValue } from '@/services/websites-url/websitesUrl.service';
import { Badge } from '@/components/ui/badge';
import { WEBSITES_URL_TABLE_COLUMNS } from '@/constants/execution';

interface WebsitesUrlTableProps {
  rows: WebsitesUrl[];
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
}

function cell(value: string | null) {
  return value ?? '—';
}

function formatStatus(status: string | null): string {
  if (!status) return '—';
  const lower = status.toLowerCase();
  if (lower === 'success') return 'Success';
  if (lower === 'failed') return 'Failed';
  return status;
}

export default function WebsitesUrlTable({
  rows,
  isLoading,
  isError,
  onRetry,
}: WebsitesUrlTableProps) {
  const colSpan = WEBSITES_URL_TABLE_COLUMNS.length;

  return (
    <div className="w-full rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <TableHeader columns={WEBSITES_URL_TABLE_COLUMNS} />
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={colSpan} className="py-12 text-center text-muted-foreground text-sm">
                  <span className="animate-pulse">Loading extraction data…</span>
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={colSpan} className="py-12 text-center text-destructive text-sm">
                  Failed to load data.{' '}
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
                  No records yet. Run Catholic PDF extraction to populate this table.
                </td>
              </tr>
            )}
            {!isLoading &&
              !isError &&
              rows.map((row) => (
                <tr
                  key={row['Record ID']}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className="font-medium text-card-foreground">
                      {cell(row['Company name'])}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {cell(row['Company Domain Name'])}
                  </td>
                  <td className="py-3 px-4">
                    {row['Website URL'] ? (
                      <a
                        href={row['Website URL'].startsWith('http') ? row['Website URL'] : `https://${row['Website URL']}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm truncate max-w-[200px] inline-block"
                      >
                        {row['Website URL']}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground max-w-[180px] truncate">
                    {cell(row['Street Address'])}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {cell(row['Phone Number'])}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {cell(row['City'])}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {cell(getStateValue(row))}
                  </td>
                  <td className="py-3 px-4">
                    {row['Status'] ? (
                      <Badge variant="secondary" className="text-xs">
                        {formatStatus(row['Status'])}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
