'use client';

import { useEffect, useState } from 'react';
import { CalendarRange, X } from 'lucide-react';
import {
  DATE_RANGE_PRESET_LABELS,
  inputDateToIso,
  isoToInputDate,
  resolvePreset,
  type DateRange,
  type DateRangePreset,
} from '@/utils/dateRange';

// Re-export so existing imports (`import { DateRange } from './DateRangePicker'`) keep working.
export type { DateRange, DateRangePreset } from '@/utils/dateRange';

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [customStart, setCustomStart] = useState(isoToInputDate(value.startIso));
  const [customEnd, setCustomEnd] = useState(isoToInputDate(value.endIso));

  // Sync local custom inputs when value changes from the outside.
  useEffect(() => {
    setCustomStart(isoToInputDate(value.startIso));
    setCustomEnd(isoToInputDate(value.endIso));
  }, [value.startIso, value.endIso]);

  const handlePresetChange = (preset: DateRangePreset) => {
    if (preset === 'none' || preset === 'custom') {
      onChange({
        preset,
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
        {(Object.keys(DATE_RANGE_PRESET_LABELS) as DateRangePreset[]).map((p) => (
          <option key={p} value={p}>
            {DATE_RANGE_PRESET_LABELS[p]}
          </option>
        ))}
      </select>

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
