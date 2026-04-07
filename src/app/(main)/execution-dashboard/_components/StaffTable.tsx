'use client';

import { Fragment } from 'react';
import { TableHeader } from '@/components/TableHeader';
import { Staff } from '@/types/execution';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/badge';
import { formatDateTime, cellValue } from '@/utils/format';
import { STAFF_TABLE_COLUMNS } from '@/constants/execution';

export default function StaffTable({
  rows,
  isLoading,
  isFetching = false,
  isError,
  onRetry,
  onInstitutionClick,
}: {
  rows: Staff[];
  isLoading: boolean;
  /** True when data is being fetched (including background refetch / filter change). Shows overlay. */
  isFetching?: boolean;
  isError: boolean;
  onRetry?: () => void;
  /** When provided, institution name is shown as a link that calls this with institution_id. */
  onInstitutionClick?: (institutionId: number) => void;
}) {
  const colSpan = STAFF_TABLE_COLUMNS.length;
  const showOverlay = isFetching && !isLoading && rows.length > 0;

  return (
    <>
    <div className="relative w-full rounded-lg border border-border overflow-hidden">
      {showOverlay && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
          <div className="flex items-center gap-2 rounded-lg bg-card px-4 py-2 shadow-md border border-border">
            <svg className="h-4 w-4 animate-spin text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
            <span className="text-sm font-medium text-muted-foreground">Loading…</span>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <TableHeader columns={STAFF_TABLE_COLUMNS} />
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
                <Fragment key={row.staff_id}>
                <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors align-top">
                  {/* Staff info */}
                  <td className="py-3 px-4 align-top max-w-[220px]">
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <div className="text-base font-semibold text-foreground truncate">{cellValue(row.name)}</div>
                      {row.role && (
                        <div className="text-xs text-muted-foreground truncate" title={row.role}>
                          {cellValue(row.role)}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Parish Role */}
                  <td className="py-3 px-4 align-top">
                    {row.par_role ? (
                      <Badge variant="outline" className="h-5 px-2 text-[11px] font-medium border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300">
                        {row.par_role}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>

                  {/* Email + contact number only (no contact field) */}
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
                        <span className="text-muted-foreground">Contact number</span>
                        <div className="text-sm text-foreground">
                          {row.contact_number ? cellValue(row.contact_number) : (
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

                  {/* Created */}
                  <td className="py-3 px-4 text-muted-foreground align-top whitespace-nowrap">
                    {formatDateTime(row.created_at)}
                  </td>
                </tr>
                </Fragment>
              ))}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
}
