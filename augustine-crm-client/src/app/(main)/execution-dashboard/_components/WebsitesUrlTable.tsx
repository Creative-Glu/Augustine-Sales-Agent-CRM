'use client';

import { TableHeader } from '@/components/TableHeader';
import { WebsitesUrl } from '@/types/websitesUrl';
import { Badge } from '@/components/ui/badge';

const EXECUTION_DASHBOARD_COLUMNS = [
  { label: 'Company name', align: 'left' as const },
  { label: 'Company Domain', align: 'left' as const },
  { label: 'Website URL', align: 'left' as const },
  { label: 'Street Address', align: 'left' as const },
  { label: 'Phone Number', align: 'left' as const },
  { label: 'City', align: 'left' as const },
  { label: 'State', align: 'left' as const },
  { label: 'Status', align: 'left' as const },
];

interface WebsitesUrlTableProps {
  rows: WebsitesUrl[];
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
}

function cell(value: string | null) {
  return value ?? '—';
}

export default function WebsitesUrlTable({
  rows,
  isLoading,
  isError,
  onRetry,
}: WebsitesUrlTableProps) {
  const colSpan = EXECUTION_DASHBOARD_COLUMNS.length;

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full">
          <TableHeader columns={EXECUTION_DASHBOARD_COLUMNS} />
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={colSpan} className="py-8 text-center text-muted-foreground">
                  <div className="animate-pulse text-sm">Loading extraction data...</div>
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={colSpan} className="py-8 text-center text-red-500">
                  Failed to load data.{' '}
                  {onRetry && (
                    <button
                      type="button"
                      onClick={onRetry}
                      className="underline font-medium ml-1"
                    >
                      Retry
                    </button>
                  )}
                </td>
              </tr>
            )}
            {!isLoading && !isError && rows.length === 0 && (
              <tr>
                <td colSpan={colSpan} className="py-8 text-center text-muted-foreground">
                  No records yet. Run Catholic PDF extraction to populate this table.
                </td>
              </tr>
            )}
            {!isLoading &&
              !isError &&
              rows.map((row) => (
                <tr
                  key={row['Record ID']}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
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
                        className="text-blue-600 hover:underline text-sm truncate max-w-[200px] inline-block"
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
                    {cell(row['State - Dropdown (COMPANY)'])}
                  </td>
                  <td className="py-3 px-4">
                    {row['Status'] ? (
                      <Badge variant="secondary" className="text-xs">
                        {row['Status']}
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
