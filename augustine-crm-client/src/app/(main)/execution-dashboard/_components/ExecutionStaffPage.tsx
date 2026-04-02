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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  DocumentArrowDownIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  EnvelopeIcon,
  NoSymbolIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import Pagination from '@/components/Pagination';
import { useStaffPaginated, useStaffCounts } from '@/services/execution/useExecutionData';
import { exportStaffCsv } from '@/services/execution/staff.service';
import { getInstitutionById } from '@/services/execution/institution.service';
import type { Institution } from '@/types/execution';
import InstitutionStaffModal from './InstitutionStaffModal';
import { useToastHelpers } from '@/lib/toast';
import { StaffFilters } from './ExecutionFilters';
import StaffTable from './StaffTable';
import { ENRICHMENT_CRITERIA } from '@/constants/execution';

const DEFAULT_LIMIT = 10;

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
  const enriched_only = searchParams.get('enriched') === '1';
  const require_phone = searchParams.get('phone') !== '0';

  const [range, setRange] = useState<'24h' | 'overall'>('24h');
  const staffQuery = useStaffPaginated();
  const countsQuery = useStaffCounts(range === '24h', enriched_only, require_phone);
  const [exportingStaff, setExportingStaff] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [institutionModalOpen, setInstitutionModalOpen] = useState(false);
  const { successToast, errorToast } = useToastHelpers();

  const handleInstitutionClick = async (institutionId: number) => {
    try {
      const institution = await getInstitutionById(institutionId);
      if (institution) {
        setSelectedInstitution(institution);
        setInstitutionModalOpen(true);
      }
    } catch {
      errorToast('Could not load institution details.');
    }
  };

  const setEnrichmentFilter = (value: 'all' | 'enriched') => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'enriched') params.set('enriched', '1');
    else params.delete('enriched');
    params.delete('offset');
    router.replace(`${basePath}?${params.toString()}`, { scroll: false });
  };

  const setRequirePhone = (required: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (required) params.delete('phone');
    else params.set('phone', '0');
    params.delete('offset');
    router.replace(`${basePath}?${params.toString()}`, { scroll: false });
  };

  const total = staffQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.floor(offset / limit) + 1;
  const hasMore = offset + limit < total;
  const showPagination = total > limit;

  return (
    <div className="space-y-6">
      {/* Main enrichment filter: on/off switch */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-wrap items-center justify-between gap-3 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <FunnelIcon className="h-4 w-4" />
            Enrichment filter
          </CardTitle>
          <div className="flex items-center gap-3">
            <Label
              htmlFor="enrichment-switch"
              className="text-sm font-medium text-muted-foreground cursor-pointer select-none"
            >
              Meets enrichment target
            </Label>
            <span className="text-xs text-muted-foreground tabular-nums min-w-[2ch]">
              {enriched_only ? 'On' : 'Off'}
            </span>
            <Switch
              id="enrichment-switch"
              checked={enriched_only}
              onCheckedChange={(checked) => setEnrichmentFilter(checked ? 'enriched' : 'all')}
              aria-label="Filter by enrichment target"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {enriched_only && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="require-phone"
                checked={require_phone}
                onCheckedChange={(checked) => setRequirePhone(checked === true)}
                aria-label="Require contact number in criteria"
              />
              <Label
                htmlFor="require-phone"
                className="text-sm font-normal cursor-pointer select-none text-muted-foreground"
              >
                Require contact number (phone optional when unchecked)
              </Label>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            {enriched_only
              ? require_phone
                ? 'Showing only contacts with Name, Role, proper email (e.g. user@domain.com), Contact number, and Institution. Export CSV uses the same filter.'
                : 'Showing contacts with Name, Role, proper email (e.g. user@domain.com), and Institution (phone optional). Export CSV uses the same filter.'
              : 'Show all staff records, or filter to contacts that meet the enrichment target. Email must be a proper format (contains @ and domain).'}
          </p>
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer hover:text-foreground font-medium">Enrichment target criteria</summary>
            <table className="mt-2 w-full border-collapse border border-border/60 rounded overflow-hidden">
              <thead>
                <tr className="bg-muted/40">
                  <th className="border border-border/60 px-2 py-1.5 text-left font-medium">Field</th>
                  <th className="border border-border/60 px-2 py-1.5 text-left font-medium">Confidence</th>
                  <th className="border border-border/60 px-2 py-1.5 text-left font-medium">Source / Notes</th>
                </tr>
              </thead>
              <tbody>
                {ENRICHMENT_CRITERIA.map((row) => (
                  <tr key={row.field}>
                    <td className="border border-border/60 px-2 py-1.5">{row.field}</td>
                    <td className="border border-border/60 px-2 py-1.5">{row.confidence}</td>
                    <td className="border border-border/60 px-2 py-1.5">{row.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </CardContent>
      </Card>

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
              <NoSymbolIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
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
            <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
              {staffQuery.isFilterLoading && (
                <svg className="h-3.5 w-3.5 animate-spin text-primary shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
              )}
              {staffQuery.isStateResolving
                ? `Loading ${(searchParams.get('state') ?? '').replace(/,/g, ', ')} data…`
                : <>
                    Showing{' '}
                    <span className="text-foreground">{staffQuery.data?.data?.length ?? 0}</span>
                    {' of '}
                    <span className="text-foreground">{total}</span>
                    {enriched_only ? ' enriched staff' : ' staff'}
                  </>
              }
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
                    const isEligibleParam = searchParams.get('is_eligible');
                    const syncedParam = searchParams.get('synced_to_hubspot');
                    const syncStatusParam = searchParams.get('sync_status');
                    const confMinParam = searchParams.get('confidence_min');
                    const confMaxParam = searchParams.get('confidence_max');
                    const stateParam = searchParams.get('state') || undefined;

                    const params: Record<string, string> = {};
                    if (searchParams.get('staff_date_from')) params.date_from = searchParams.get('staff_date_from')!;
                    if (searchParams.get('staff_date_to')) params.date_to = searchParams.get('staff_date_to')!;
                    if (isEligibleParam === '1') params.is_eligible = 'true';
                    else if (isEligibleParam === '0') params.is_eligible = 'false';
                    if (stateParam) params.state = stateParam;
                    const parRoleParam = searchParams.get('par_role');
                    if (parRoleParam) params.par_role_filter = parRoleParam;

                    await exportStaffCsv(params);
                    successToast('CSV export downloaded.');
                  } catch (e) {
                    errorToast(e instanceof Error ? e.message : 'Export failed');
                  } finally {
                    setExportingStaff(false);
                  }
                }}
                className="gap-2"
              >
                <DocumentArrowDownIcon className="w-4 h-4 shrink-0" />
                {exportingStaff ? 'Exporting…' : enriched_only ? 'Export enriched CSV' : 'Export CSV'}
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Per page</span>
                <Select
                  value={String(limit)}
                  onValueChange={(v) => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('limit', v);
                    params.delete('offset');
                    router.replace(`${basePath}?${params.toString()}`, { scroll: false });
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
            isFetching={staffQuery.isFilterLoading}
            isError={staffQuery.isError}
            onRetry={() => staffQuery.refetch()}
            onInstitutionClick={handleInstitutionClick}
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

      <InstitutionStaffModal
        institution={selectedInstitution}
        open={institutionModalOpen}
        onOpenChange={setInstitutionModalOpen}
        mode="details"
      />
    </div>
  );
}
