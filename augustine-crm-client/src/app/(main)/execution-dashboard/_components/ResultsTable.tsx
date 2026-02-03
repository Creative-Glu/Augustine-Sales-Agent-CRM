'use client';

import { TableHeader } from '@/components/TableHeader';
import { Result } from '@/types/execution';
import { Badge } from '@/components/ui/badge';

const COLUMNS = [
  { label: 'Result ID', align: 'left' as const },
  { label: 'Job ID', align: 'left' as const },
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
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full">
          <TableHeader columns={COLUMNS} />
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={colSpan} className="py-8 text-center text-muted-foreground">
                  Loading results…
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={colSpan} className="py-8 text-center text-red-500">
                  Failed to load. {onRetry && <button type="button" onClick={onRetry} className="underline ml-1">Retry</button>}
                </td>
              </tr>
            )}
            {!isLoading && !isError && rows.length === 0 && (
              <tr>
                <td colSpan={colSpan} className="py-8 text-center text-muted-foreground">
                  No results found.
                </td>
              </tr>
            )}
            {!isLoading &&
              !isError &&
              rows.map((row) => (
                <tr key={row.result_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-mono text-sm truncate max-w-[160px]" title={row.result_id}>
                    {row.result_id}
                  </td>
                  <td className="py-3 px-4 font-mono text-sm truncate max-w-[160px]" title={row.job_id}>
                    {row.job_id}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <a
                      href={row.url.startsWith('http') ? row.url : `https://${row.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline truncate max-w-[220px] inline-block"
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
                  <td className="py-3 px-4 text-sm text-muted-foreground">{formatDate(row.processed_at)}</td>
                  <td className="py-3 px-4 text-sm text-red-600 max-w-[180px] truncate" title={row.error ?? ''}>
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
