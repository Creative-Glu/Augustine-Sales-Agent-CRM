'use client';

import { Fragment } from 'react';
import { TableHeader } from '@/components/TableHeader';
import type { Institution } from '@/types/execution';
import { formatDateTime, cellValue } from '@/utils/format';
import { sanitizeUrl } from '@/utils/url';
import { INSTITUTION_TABLE_COLUMNS } from '@/constants/execution';

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
  const colSpan = INSTITUTION_TABLE_COLUMNS.length;

  return (
    <>
    <div className="w-full rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <TableHeader columns={INSTITUTION_TABLE_COLUMNS} />
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
                <Fragment key={row.id}>
                  <tr
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer align-top"
                    onClick={() => onSelect?.(row)}
                  >
                    {/* Institution info block */}
                    <td className="py-3 px-4 align-top">
                    <div className="flex flex-col gap-1.5">
                      <div className="text-base font-semibold text-foreground truncate">{cellValue(row.name)}</div>
                      {row.website_url && (
                        <a
                          href={sanitizeUrl(row.website_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline truncate max-w-[220px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {row.website_url}
                        </a>
                      )}
                      {row.type && (
                        <span className="text-xs text-muted-foreground">
                          {row.type}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Email + contact number (institution has contact stored as contact number) */}
                  <td className="py-3 px-4 align-top">
                    <div className="flex flex-col gap-1.5 text-xs">
                      <div>
                        <span className="text-muted-foreground">Email</span>
                        <div className="text-sm text-foreground">
                          {row.email ? cellValue(row.email) : <span className="text-muted-foreground">Not available</span>}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Contact number</span>
                        <div className="text-sm text-foreground">
                          {row.contact ? cellValue(row.contact) : (
                            <span className="text-muted-foreground">Not available</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Address – fixed min width so address wraps in readable chunks, not one word per line */}
                  <td className="py-3 px-4 align-top" style={{ minWidth: '220px' }}>
                    <div className="text-sm text-foreground break-words" title={row.address ?? undefined}>
                      {row.address ? cellValue(row.address) : <span className="text-muted-foreground">Not available</span>}
                    </div>
                  </td>

                  {/* Created date */}
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
