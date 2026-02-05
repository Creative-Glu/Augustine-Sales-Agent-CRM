'use client';

import { TableHeader } from '@/components/TableHeader';
import type { Institution } from '@/types/execution';

const COLUMNS = [
  { label: 'Name', align: 'left' as const },
  { label: 'Email', align: 'left' as const },
  { label: 'Contact', align: 'left' as const },
  { label: 'Website', align: 'left' as const },
  { label: 'Address', align: 'left' as const },
  { label: 'Type', align: 'left' as const },
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
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full">
          <TableHeader columns={COLUMNS} />
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={colSpan} className="py-8 text-center text-muted-foreground">
                  Loading institutions…
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={colSpan} className="py-8 text-center text-red-500">
                  Failed to load.{' '}
                  {onRetry && (
                    <button type="button" onClick={onRetry} className="underline ml-1">
                      Retry
                    </button>
                  )}
                </td>
              </tr>
            )}
            {!isLoading && !isError && rows.length === 0 && (
              <tr>
                <td colSpan={colSpan} className="py-8 text-center text-muted-foreground">
                  No institutions found.
                </td>
              </tr>
            )}
            {!isLoading &&
              !isError &&
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onSelect?.(row)}
                >
                  <td className="py-3 px-4 font-medium text-card-foreground">{cell(row.name)}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{cell(row.email)}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{cell(row.contact)}</td>
                  <td className="py-3 px-4 text-sm">
                    {row.website_url ? (
                      <a
                        href={row.website_url.startsWith('http') ? row.website_url : `https://${row.website_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate max-w-[180px] inline-block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {row.website_url}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground max-w-[200px] truncate">
                    {cell(row.address)}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{cell(row.type)}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
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
