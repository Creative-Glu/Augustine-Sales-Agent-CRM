'use client';

import { TableHeader } from '@/components/TableHeader';
import { Staff } from '@/types/execution';

const COLUMNS = [
  { label: 'Staff ID', align: 'left' as const },
  { label: 'Result ID', align: 'left' as const },
  { label: 'Name', align: 'left' as const },
  { label: 'Role', align: 'left' as const },
  { label: 'Email', align: 'left' as const },
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
}: {
  rows: Staff[];
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
                  Loading staff…
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
                  No staff found.
                </td>
              </tr>
            )}
            {!isLoading &&
              !isError &&
              rows.map((row) => (
                <tr key={row.staff_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-mono text-sm truncate max-w-[160px]" title={row.staff_id}>
                    {row.staff_id}
                  </td>
                  <td className="py-3 px-4 font-mono text-sm truncate max-w-[160px]" title={row.result_id}>
                    {row.result_id}
                  </td>
                  <td className="py-3 px-4 font-medium text-card-foreground">{cell(row.name)}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{cell(row.role)}</td>
                  <td className="py-3 px-4 text-sm">
                    {row.email ? (
                      <a href={`mailto:${row.email}`} className="text-blue-600 hover:underline">
                        {row.email}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{formatDate(row.created_at)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
