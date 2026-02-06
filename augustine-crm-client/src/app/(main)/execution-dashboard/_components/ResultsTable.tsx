'use client';

import { TableHeader } from '@/components/TableHeader';
import { Result } from '@/types/execution';
import { Badge } from '@/components/ui/badge';

const COLUMNS = [
  { label: 'URL', align: 'left' as const },
  { label: 'Source', align: 'left' as const },
  { label: 'Status', align: 'left' as const },
  { label: 'Processed', align: 'left' as const },
  { label: 'Error', align: 'left' as const },
];

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function ResultsTable({
  rows,
  isLoading,
  isError,
  onRetry,
}: {
  rows: Result[];
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
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
                  Loading results…
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
                  No results found.
                </td>
              </tr>
            )}
            {!isLoading &&
              !isError &&
              rows.map((row) => (
                <tr key={row.result_id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <a
                      href={row.url.startsWith('http') ? row.url : `https://${row.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline truncate max-w-[220px] inline-block"
                    >
                      {row.url}
                    </a>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="text-xs">{row.source}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={row.status === 'success' ? 'secondary' : 'destructive'} className="text-xs">
                      {row.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{formatDate(row.processed_at)}</td>
                  <td className="py-3 px-4 text-destructive max-w-[180px] truncate" title={row.error ?? ''}>
                    {row.error ?? '—'}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
