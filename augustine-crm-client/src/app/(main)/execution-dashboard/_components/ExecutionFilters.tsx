'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
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

const BASE = '/execution-dashboard';

function useExecutionParams() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v === null || v === '') params.delete(k);
        else params.set(k, v);
      }
      if (updates.offset === undefined) params.delete('offset');
      router.push(`${BASE}?${params.toString()}`);
    },
    [router, searchParams]
  );

  return { searchParams, setParams };
}

export function WebsitesUrlFilters() {
  const { searchParams, setParams } = useExecutionParams();
  const status = searchParams.get('status') ?? '';
  const company_search = searchParams.get('company_search') ?? '';

  return (
    <div className="flex flex-wrap items-end gap-4 mb-4">
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
            <SelectItem value="success">success</SelectItem>
            <SelectItem value="failed">failed</SelectItem>
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
    </div>
  );
}

export function JobsFilters() {
  const { searchParams, setParams } = useExecutionParams();
  const job_status = (searchParams.get('job_status') as JobStatusFilter) ?? 'all';

  return (
    <div className="flex flex-wrap items-end gap-4 mb-4">
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
    </div>
  );
}

export function ResultsFilters() {
  const { searchParams, setParams } = useExecutionParams();
  const result_status = (searchParams.get('result_status') as ResultStatusFilter) ?? 'all';
  const result_source = (searchParams.get('result_source') as ResultSourceFilter) ?? 'all';
  const job_id = searchParams.get('job_id') ?? '';

  return (
    <div className="flex flex-wrap items-end gap-4 mb-4">
      <div className="space-y-1">
        <Label className="text-xs">Job ID</Label>
        <Input
          placeholder="Filter by job ID"
          className="w-[280px] font-mono text-sm"
          value={job_id}
          onChange={(e) => setParams({ job_id: e.target.value || null, offset: null })}
        />
      </div>
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
    </div>
  );
}

export function StaffFilters() {
  const { searchParams, setParams } = useExecutionParams();
  const result_id = searchParams.get('result_id') ?? '';
  const staff_name = searchParams.get('staff_name') ?? '';
  const staff_email = searchParams.get('staff_email') ?? '';

  return (
    <div className="flex flex-wrap items-end gap-4 mb-4">
      <div className="space-y-1">
        <Label className="text-xs">Result ID</Label>
        <Input
          placeholder="Filter by result ID"
          className="w-[280px] font-mono text-sm"
          value={result_id}
          onChange={(e) => setParams({ result_id: e.target.value || null, offset: null })}
        />
      </div>
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
    </div>
  );
}
