'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect, useRef } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { JobStatusFilter } from '@/services/execution/job.service';
import type { ResultStatusFilter, ResultSourceFilter } from '@/services/execution/result.service';
import type { SyncStatus } from '@/types/execution';
import { useDistinctStates } from '@/services/execution/useExecutionData';
import { useQuery } from '@tanstack/react-query';
import { listRoles } from '@/services/augustine/roles.service';
import { MultiSelect } from '@/components/MultiSelect';

function useExecutionParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const basePath = pathname ?? '/execution-dashboard';

  const setParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v === null || v === '') params.delete(k);
        else params.set(k, v);
      }
      if (updates.offset === undefined) params.delete('offset');
      router.replace(`${basePath}?${params.toString()}`, { scroll: false });
    },
    [router, searchParams, basePath]
  );

  return { searchParams, setParams };
}

const DEBOUNCE_MS = 500;

/** Input that types locally and debounces the param update. */
function DebouncedInput({
  value: urlValue,
  onDebouncedChange,
  ...props
}: Omit<React.ComponentProps<typeof Input>, 'onChange' | 'value'> & {
  value: string;
  onDebouncedChange: (val: string) => void;
}) {
  const [local, setLocal] = useState(urlValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local state when URL value changes externally (e.g. Reset button)
  useEffect(() => { setLocal(urlValue); }, [urlValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocal(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onDebouncedChange(val), DEBOUNCE_MS);
  };

  // Cleanup timer on unmount
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return <Input {...props} value={local} onChange={handleChange} />;
}

const filterBarClass =
  'flex flex-wrap items-end gap-4 p-4 rounded-lg bg-muted/40 dark:bg-muted/20 border border-border/60 mb-4';

export function WebsitesUrlFilters() {
  const { searchParams, setParams } = useExecutionParams();
  const status = searchParams.get('status') ?? '';
  const company_search = searchParams.get('company_search') ?? '';

  return (
    <div className={filterBarClass}>
      <div className="space-y-1">
        <Label className="text-xs">Status</Label>
        <Select
          value={status || 'all'}
          onValueChange={(v) => setParams({ status: v === 'all' ? null : v, offset: null })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Missing URL">Missing URL</SelectItem>
            <SelectItem value="Processing">Processing</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Company name</Label>
        <DebouncedInput
          placeholder="Search company..."
          className="w-[200px]"
          value={company_search}
          onDebouncedChange={(v) => setParams({ company_search: v || null, offset: null })}
        />
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setParams({ status: null, company_search: null, offset: null })}
        className="gap-2 cursor-pointer"
      >
        <ArrowPathIcon className="w-4 h-4 shrink-0" />
        Reset
      </Button>
    </div>
  );
}

export function JobsFilters() {
  const { searchParams, setParams } = useExecutionParams();
  const job_status = (searchParams.get('job_status') as JobStatusFilter) ?? 'all';

  return (
    <div className={filterBarClass}>
      <div className="space-y-1">
        <Label className="text-xs">Status</Label>
        <Select
          value={job_status}
          onValueChange={(v) => setParams({ job_status: v === 'all' ? null : v, offset: null })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setParams({ job_status: null, offset: null })}
        className="gap-2 cursor-pointer"
      >
        <ArrowPathIcon className="w-4 h-4 shrink-0" />
        Reset
      </Button>
    </div>
  );
}

export function ResultsFilters() {
  const { searchParams, setParams } = useExecutionParams();
  const result_status = (searchParams.get('result_status') as ResultStatusFilter) ?? 'all';
  const result_source = (searchParams.get('result_source') as ResultSourceFilter) ?? 'all';

  return (
    <div className={filterBarClass}>
      <div className="space-y-1">
        <Label className="text-xs">Status</Label>
        <Select
          value={result_status}
          onValueChange={(v) => setParams({ result_status: v === 'all' ? null : v, offset: null })}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Source</Label>
        <Select
          value={result_source}
          onValueChange={(v) => setParams({ result_source: v === 'all' ? null : v, offset: null })}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="web">Web</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setParams({ result_status: null, result_source: null, offset: null })}
        className="gap-2 cursor-pointer"
      >
        <ArrowPathIcon className="w-4 h-4 shrink-0" />
        Reset
      </Button>
    </div>
  );
}

export function InstitutionFilters() {
  const { searchParams, setParams } = useExecutionParams();
  const is_eligible = searchParams.get('is_eligible') ?? '';
  const synced_to_hubspot = searchParams.get('synced_to_hubspot') ?? '';
  const sync_status = searchParams.get('sync_status') ?? '';
  const confidence_min = searchParams.get('confidence_min') ?? '';
  const confidence_max = searchParams.get('confidence_max') ?? '';

  return (
    <div className={filterBarClass}>
      <div className="space-y-1">
        <Label className="text-xs">Eligible</Label>
        <Select
          value={is_eligible || 'all'}
          onValueChange={(v) => setParams({ is_eligible: v === 'all' ? null : v, offset: null })}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="1">Yes</SelectItem>
            <SelectItem value="0">No</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Synced to HubSpot</Label>
        <Select
          value={synced_to_hubspot || 'all'}
          onValueChange={(v) => setParams({ synced_to_hubspot: v === 'all' ? null : v, offset: null })}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="1">Yes</SelectItem>
            <SelectItem value="0">No</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Sync status</Label>
        <Select
          value={sync_status || 'all'}
          onValueChange={(v) => setParams({ sync_status: v === 'all' ? null : (v as SyncStatus), offset: null })}
        >
          <SelectTrigger className="w-[110px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Confidence min (%)</Label>
        <div className="flex items-center gap-1">
          <Input
            type="text"
            inputMode="numeric"
            placeholder="0"
            className="w-[72px] text-right tabular-nums"
            value={confidence_min}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '').slice(0, 3);
              setParams({ confidence_min: digits || null, offset: null });
            }}
          />
          <span className="text-xs text-muted-foreground">%</span>
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Confidence max (%)</Label>
        <div className="flex items-center gap-1">
          <Input
            type="text"
            inputMode="numeric"
            placeholder="100"
            className="w-[72px] text-right tabular-nums"
            value={confidence_max}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '').slice(0, 3);
              setParams({ confidence_max: digits || null, offset: null });
            }}
          />
          <span className="text-xs text-muted-foreground">%</span>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          setParams({
            is_eligible: null,
            synced_to_hubspot: null,
            sync_status: null,
            confidence_min: null,
            confidence_max: null,
            offset: null,
          })
        }
        className="gap-2 cursor-pointer"
      >
        <ArrowPathIcon className="w-4 h-4 shrink-0" />
        Reset
      </Button>
    </div>
  );
}

/** Parse a comma-separated URL param into an array. */
function parseMultiParam(sp: URLSearchParams, key: string): string[] {
  const raw = sp.get(key) ?? '';
  if (!raw) return [];
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

export function StaffFilters() {
  const { searchParams, setParams } = useExecutionParams();
  const staff_date_from = searchParams.get('staff_date_from') ?? '';
  const staff_date_to = searchParams.get('staff_date_to') ?? '';
  const is_eligible = searchParams.get('is_eligible') ?? '';
  const selectedStates = parseMultiParam(searchParams, 'state');
  const selectedRoles = parseMultiParam(searchParams, 'par_role');
  const statesQuery = useDistinctStates();
  const rolesQuery = useQuery({ queryKey: ['augustine', 'roles', 'list'], queryFn: listRoles });

  const stateOptions = (statesQuery.data ?? []).map((s) => ({ label: s, value: s }));
  const roleOptions = (rolesQuery.data ?? []).map((r) => ({ label: r.name, value: r.name }));

  return (
    <div className={filterBarClass}>
      <div className="space-y-1 min-w-[180px] max-w-[280px]">
        <Label className="text-xs">State</Label>
        <MultiSelect
          options={stateOptions}
          selected={selectedStates}
          onChange={(vals) => setParams({ state: vals.length > 0 ? vals.join(',') : null, offset: null })}
          placeholder="All States"
          loading={statesQuery.isLoading}
        />
      </div>
      <div className="space-y-1 min-w-[220px] max-w-[320px]">
        <Label className="text-xs">Parish Role</Label>
        <MultiSelect
          options={roleOptions}
          selected={selectedRoles}
          onChange={(vals) => setParams({ par_role: vals.length > 0 ? vals.join(',') : null, offset: null })}
          placeholder="All Roles"
          loading={rolesQuery.isLoading}
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">From date</Label>
        <Input
          type="date"
          className="w-[140px]"
          value={staff_date_from}
          onChange={(e) => setParams({ staff_date_from: e.target.value || null, offset: null })}
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">To date</Label>
        <Input
          type="date"
          className="w-[140px]"
          value={staff_date_to}
          onChange={(e) => setParams({ staff_date_to: e.target.value || null, offset: null })}
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Eligible</Label>
        <Select
          value={is_eligible || 'all'}
          onValueChange={(v) => setParams({ is_eligible: v === 'all' ? null : v, offset: null })}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="1">Yes</SelectItem>
            <SelectItem value="0">No</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          setParams({
            state: null,
            par_role: null,
            staff_date_from: null,
            staff_date_to: null,
            is_eligible: null,
            offset: null,
          })
        }
        className="gap-2 cursor-pointer"
      >
        <ArrowPathIcon className="w-4 h-4 shrink-0" />
        Reset
      </Button>
    </div>
  );
}
