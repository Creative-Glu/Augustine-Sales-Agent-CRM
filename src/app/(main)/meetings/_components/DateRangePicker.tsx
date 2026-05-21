'use client';

import { useEffect, useState } from 'react';
import { CalendarRange, X } from 'lucide-react';

export type DateRangePreset =
  | 'none'
  | 'today'
  | 'tomorrow'
  | 'this-week'
  | 'next-week'
  | 'this-month'
  | 'last-7d'
  | 'last-30d'
  | 'last-90d'
  | 'next-7d'
  | 'next-30d'
  | 'custom';

export interface DateRange {
  preset: DateRangePreset;
  /** ISO timestamp, inclusive. */
  startIso: string | null;
  /** ISO timestamp, exclusive. */
  endIso: string | null;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const PRESET_LABELS: Record<DateRangePreset, string> = {
  none: 'No date range',
  today: 'Today',
  tomorrow: 'Tomorrow',
  'this-week': 'This week',
  'next-week': 'Next week',
  'this-month': 'This month',
  'last-7d': 'Last 7 days',
  'last-30d': 'Last 30 days',
  'last-90d': 'Last 90 days',
  'next-7d': 'Next 7 days',
  'next-30d': 'Next 30 days',
  custom: 'Custom range…',
};

/** Returns the start of `day` in local time as a Date. */
function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** Returns the start of the week (Monday) for `d`. */
function startOfWeek(d: Date): Date {
  const copy = startOfDay(d);
  const day = copy.getDay(); // 0 = Sun, 1 = Mon
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function startOfMonth(d: Date): Date {
  const copy = startOfDay(d);
  copy.setDate(1);
  return copy;
}

function endOfMonth(d: Date): Date {
  const copy = startOfDay(d);
  copy.setMonth(copy.getMonth() + 1);
  copy.setDate(1);
  return copy;
}

/** Compute ISO start/end for a preset relative to "now". */
export function resolvePreset(preset: DateRangePreset): {
  startIso: string | null;
  endIso: string | null;
} {
  const now = new Date();
  switch (preset) {
    case 'today': {
      const s = startOfDay(now);
      const e = addDays(s, 1);
      return { startIso: s.toISOString(), endIso: e.toISOString() };
    }
    case 'tomorrow': {
      const s = addDays(startOfDay(now), 1);
      const e = addDays(s, 1);
      return { startIso: s.toISOString(), endIso: e.toISOString() };
    }
    case 'this-week': {
      const s = startOfWeek(now);
      const e = addDays(s, 7);
      return { startIso: s.toISOString(), endIso: e.toISOString() };
    }
    case 'next-week': {
      const s = addDays(startOfWeek(now), 7);
      const e = addDays(s, 7);
      return { startIso: s.toISOString(), endIso: e.toISOString() };
    }
    case 'this-month': {
      const s = startOfMonth(now);
      const e = endOfMonth(now);
      return { startIso: s.toISOString(), endIso: e.toISOString() };
    }
    case 'last-7d':
      return {
        startIso: addDays(startOfDay(now), -7).toISOString(),
        endIso: now.toISOString(),
      };
    case 'last-30d':
      return {
        startIso: addDays(startOfDay(now), -30).toISOString(),
        endIso: now.toISOString(),
      };
    case 'last-90d':
      return {
        startIso: addDays(startOfDay(now), -90).toISOString(),
        endIso: now.toISOString(),
      };
    case 'next-7d':
      return {
        startIso: now.toISOString(),
        endIso: addDays(startOfDay(now), 8).toISOString(),
      };
    case 'next-30d':
      return {
        startIso: now.toISOString(),
        endIso: addDays(startOfDay(now), 31).toISOString(),
      };
    case 'none':
    case 'custom':
    default:
      return { startIso: null, endIso: null };
  }
}

function isoToInputDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function inputDateToIso(value: string, endOfDay = false): string | null {
  if (!value) return null;
  const [yStr, mStr, dStr] = value.split('-');
  const y = Number(yStr);
  const m = Number(mStr);
  const d = Number(dStr);
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d, 0, 0, 0, 0);
  if (endOfDay) {
    dt.setHours(23, 59, 59, 999);
  }
  return dt.toISOString();
}

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [customStart, setCustomStart] = useState(isoToInputDate(value.startIso));
  const [customEnd, setCustomEnd] = useState(isoToInputDate(value.endIso));

  // Sync local custom inputs when value changes from the outside
  useEffect(() => {
    setCustomStart(isoToInputDate(value.startIso));
    setCustomEnd(isoToInputDate(value.endIso));
  }, [value.startIso, value.endIso]);

  const handlePresetChange = (preset: DateRangePreset) => {
    if (preset === 'none' || preset === 'custom') {
      onChange({
        preset,
        // 'custom' keeps the existing ISO values so the inputs persist
        startIso: preset === 'custom' ? value.startIso : null,
        endIso: preset === 'custom' ? value.endIso : null,
      });
      return;
    }
    const { startIso, endIso } = resolvePreset(preset);
    onChange({ preset, startIso, endIso });
  };

  const handleCustomChange = (start: string, end: string) => {
    setCustomStart(start);
    setCustomEnd(end);
    onChange({
      preset: 'custom',
      startIso: inputDateToIso(start, false),
      endIso: inputDateToIso(end, true),
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-700">
        <CalendarRange className="w-3.5 h-3.5 text-slate-500" />
        Date Range
      </label>

      <select
        value={value.preset}
        onChange={(e) => handlePresetChange(e.target.value as DateRangePreset)}
        className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 cursor-pointer focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
      >
        {(Object.keys(PRESET_LABELS) as DateRangePreset[]).map((p) => (
          <option key={p} value={p}>
            {PRESET_LABELS[p]}
          </option>
        ))}
      </select>

      {/* Custom date inputs — only when "custom" is selected */}
      {value.preset === 'custom' && (
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={customStart}
            onChange={(e) => handleCustomChange(e.target.value, customEnd)}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 cursor-pointer focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            aria-label="Start date"
          />
          <span className="text-slate-400 text-xs">→</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => handleCustomChange(customStart, e.target.value)}
            min={customStart || undefined}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 cursor-pointer focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            aria-label="End date"
          />
        </div>
      )}

      {/* Clear button — only when an active range is set */}
      {value.preset !== 'none' && (
        <button
          type="button"
          onClick={() => handlePresetChange('none')}
          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
          title="Clear date range"
        >
          <X className="w-3 h-3" />
          Clear
        </button>
      )}
    </div>
  );
}
