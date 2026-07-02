'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { STAGE_ORDER } from '@/constants/journey';

export type DateRangeKey = 'all' | '7d' | '30d' | '90d';

export interface JourneyFilterState {
  search: string;
  stage: string;
  campaign: string;
  institutionType: string;
  dateRange: DateRangeKey;
}

export const DEFAULT_JOURNEY_FILTERS: JourneyFilterState = {
  search: '',
  stage: 'all',
  campaign: 'all',
  institutionType: 'all',
  dateRange: 'all',
};

interface JourneyFiltersProps {
  filters: JourneyFilterState;
  onChange: (next: JourneyFilterState) => void;
  campaignOptions: { id: string; name: string }[];
  institutionTypeOptions: string[];
}

const DATE_RANGE_OPTIONS: { value: DateRangeKey; label: string }[] = [
  { value: 'all', label: 'All time' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
];

export default function JourneyFilters({
  filters,
  onChange,
  campaignOptions,
  institutionTypeOptions,
}: JourneyFiltersProps) {
  const set = <K extends keyof JourneyFilterState>(key: K, value: JourneyFilterState[K]) =>
    onChange({ ...filters, [key]: value });

  const isDirty =
    filters.search !== '' ||
    filters.stage !== 'all' ||
    filters.campaign !== 'all' ||
    filters.institutionType !== 'all' ||
    filters.dateRange !== 'all';

  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-md border border-border/60 p-4 md:p-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <Input
            placeholder="Search parish, diocese, email..."
            value={filters.search}
            onChange={(e) => set('search', e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={filters.stage} onValueChange={(v) => set('stage', v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            {STAGE_ORDER.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.campaign} onValueChange={(v) => set('campaign', v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Campaign" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All campaigns</SelectItem>
            {campaignOptions.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.institutionType}
          onValueChange={(v) => set('institutionType', v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Institution" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All institutions</SelectItem>
            {institutionTypeOptions.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.dateRange}
          onValueChange={(v) => set('dateRange', v as DateRangeKey)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGE_OPTIONS.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isDirty && (
        <div className="mt-3 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange(DEFAULT_JOURNEY_FILTERS)}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900"
          >
            <X className="w-4 h-4 mr-1" />
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
