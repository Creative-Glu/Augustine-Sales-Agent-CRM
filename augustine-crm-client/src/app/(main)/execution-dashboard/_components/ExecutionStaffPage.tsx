'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { DocumentArrowDownIcon, ArrowPathIcon, CalendarDaysIcon, EnvelopeIcon, EnvelopeSlashIcon } from '@heroicons/react/24/outline';
import Pagination from '@/components/Pagination';
import { useStaffPaginated, useStaffCounts } from '@/services/execution/useExecutionData';
import { getStaffForExport } from '@/services/execution/staff.service';
import { useToastHelpers } from '@/lib/toast';
import type { Staff } from '@/types/execution';
import { StaffFilters } from './ExecutionFilters';
import StaffTable from './StaffTable';

const DEFAULT_LIMIT = 10;

function escapeCsvCell(value: string | null): string {
  if (value == null) return '';
  const s = String(value);
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function staffToCsv(rows: Staff[]): string {
  const header = 'staff_id,result_id,name,role,email,contact_number,created_at';
  const body = rows.map(
    (r) =>
      [r.staff_id, r.result_id, r.name, r.role, r.email, r.contact_number, r.created_at]
        .map(escapeCsvCell)
        .join(',')
  );
  return [header, ...body].join('\r\n');
}

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function getLimit(searchParams: URLSearchParams): number {
  const v = searchParams.get('limit');
  const n = v ? parseInt(v, 10) : NaN;
  return Number.isNaN(n) || n < 1 ? DEFAULT_LIMIT : Math.min(n, 100);
}

function getOffset(searchParams: URLSearchParams): number {
  const v = searchParams.get('offset');
  const n = v ? parseInt(v, 10) : NaN;
  return Number.isNaN(n) || n < 0 ? 0 : n;
}

export default function ExecutionStaffPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const basePath = pathname ?? '/execution-dashboard/staff';
  const limit = getLimit(searchParams);
  const offset = getOffset(searchParams);

  const [range, setRange] = useState<'24h' | 'overall'>('24h');
  const staffQuery = useStaffPaginated();
  const countsQuery = useStaffCounts(range === '24h');
  const [exportingStaff, setExportingStaff] = useState(false);
  const { successToast, errorToast } = useToastHelpers();

  const total = staffQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.floor(offset / limit) + 1;
  const hasMore = offset + limit < total;
  const showPagination = total > limit;

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-wrap items-center justify-between gap-3 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <CalendarDaysIcon className="h-4 w-4" />
            Extracted data · Accuracy level
          </CardTitle>
          <ToggleGroup
            type="single"
            value={range}
            onValueChange={(v) => v && setRange(v as '24h' | 'overall')}
            variant="outline"
            size="sm"
            className="rounded-lg"
          >
            <ToggleGroupItem value="24h" aria-label="Last 24 hours">Last 24h</ToggleGroupItem>
            <ToggleGroupItem value="overall" aria-label="Overall">Overall</ToggleGroupItem>
          </ToggleGroup>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-2xl font-bold tabular-nums text-foreground">
            {countsQuery.isLoading ? '—' : countsQuery.isError ? '—' : countsQuery.data?.total ?? 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {range === '24h' ? 'Staff records added in the last 24 hours' : 'Total staff records'}
          </p>
          <div className="flex flex-wrap gap-4 pt-2 border-t border-border/60 text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <EnvelopeIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
              <strong className="text-foreground tabular-nums">
                {countsQuery.isLoading ? '—' : countsQuery.isError ? '—' : countsQuery.data?.withEmail ?? 0}
              </strong>
              with email
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <EnvelopeSlashIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <strong className="text-foreground tabular-nums">
                {countsQuery.isLoading ? '—' : countsQuery.isError ? '—' : countsQuery.data?.withoutEmail ?? 0}
              </strong>
              without email
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-6">
          <StaffFilters />
          <div className="flex items-center justify-between gap-4 flex-wrap py-4 border-b border-border/60">
            <p className="text-sm text-muted-foreground font-medium">
              Showing{' '}
              <span className="text-foreground">{staffQuery.data?.data?.length ?? 0}</span>
              {' of '}
              <span className="text-foreground">{total}</span> staff
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={exportingStaff}
                onClick={async () => {
                  setExportingStaff(true);
                  try {
                    const params = {
                      name_search: searchParams.get('staff_name') || undefined,
                      email_search: searchParams.get('staff_email') || undefined,
                      date_from: searchParams.get('staff_date_from') || undefined,
                      date_to: searchParams.get('staff_date_to') || undefined,
                    };
                    const rows = await getStaffForExport(params);
                    if (rows.length === 0) {
                      errorToast('No staff records to export with current filters.');
                      return;
                    }
                    const csv = staffToCsv(rows);
                    downloadCsv(csv, `staff_export_${new Date().toISOString().slice(0, 10)}.csv`);
                    successToast(`Exported ${rows.length} staff record(s).`);
                  } catch (e) {
                    errorToast(e instanceof Error ? e.message : 'Export failed');
                  } finally {
                    setExportingStaff(false);
                  }
                }}
                className="gap-2"
              >
                <DocumentArrowDownIcon className="w-4 h-4 shrink-0" />
                {exportingStaff ? 'Exporting…' : 'Export CSV'}
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Per page</span>
                <Select
                  value={String(limit)}
                  onValueChange={(v) => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('limit', v);
                    params.delete('offset');
                    router.push(`${basePath}?${params.toString()}`);
                  }}
                >
                  <SelectTrigger className="w-[72px] h-9 border-border/80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => staffQuery.refetch()}
              >
                <ArrowPathIcon className="w-4 h-4 shrink-0" />
                Refresh
              </Button>
            </div>
          </div>

          <StaffTable
            rows={staffQuery.data?.data ?? []}
            isLoading={staffQuery.isLoading}
            isError={staffQuery.isError}
            onRetry={() => staffQuery.refetch()}
          />
        </div>
      </div>

      {showPagination && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          currentOffset={offset}
          limit={limit}
          hasMore={hasMore}
          basePath={basePath}
          queryParamName="offset"
        />
      )}
    </div>
  );
}
