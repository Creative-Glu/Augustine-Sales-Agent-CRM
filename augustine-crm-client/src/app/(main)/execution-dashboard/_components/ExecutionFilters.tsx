'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
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
      router.push(`${basePath}?${params.toString()}`);
    },
    [router, searchParams, basePath]
  );

  return { searchParams, setParams };
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
        <Input
          placeholder="Search company..."
          className="w-[200px]"
          value={company_search}
          onChange={(e) => setParams({ company_search: e.target.value || null, offset: null })}
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

export function StaffFilters() {
  const { searchParams, setParams } = useExecutionParams();
  const staff_name = searchParams.get('staff_name') ?? '';
  const staff_email = searchParams.get('staff_email') ?? '';
  const staff_date_from = searchParams.get('staff_date_from') ?? '';
  const staff_date_to = searchParams.get('staff_date_to') ?? '';

  return (
    <div className={filterBarClass}>
      <div className="space-y-1">
        <Label className="text-xs">Name</Label>
        <Input
          placeholder="Search name"
          className="w-[180px]"
          value={staff_name}
          onChange={(e) => setParams({ staff_name: e.target.value || null, offset: null })}
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Email</Label>
        <Input
          placeholder="Search email"
          className="w-[200px]"
          value={staff_email}
          onChange={(e) => setParams({ staff_email: e.target.value || null, offset: null })}
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
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          setParams({
            staff_name: null,
            staff_email: null,
            staff_date_from: null,
            staff_date_to: null,
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
