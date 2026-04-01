'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import {
  parseCsv,
  mergeCsvs,
  mergedRowsToCsv,
  type MergeResult,
  type MergedRow,
  type MatchedRecordDiff,
} from '@/lib/csv-merge';

// ─── Types ─────────────────────────────────────────────────────────────────

type UploadSlot = {
  file: File | null;
  rows: Record<string, string>[];
  columns: string[];
  error: string | null;
};

const EMPTY_SLOT: UploadSlot = { file: null, rows: [], columns: [], error: null };

// ─── Filter & Sort types ──────────────────────────────────────────────────

type FilterCategory = 'new_scraped' | 'updated' | 'matched_no_changes' | 'hubspot_only';

type SortOption =
  | 'record_group'
  | 'company_asc'
  | 'company_desc'
  | 'email_present'
  | 'email_missing';

function getFilterCategory(row: MergedRow): FilterCategory {
  if (row['Record Group'] === 'new_scraped') return 'new_scraped';
  if (row['Record Group'] === 'updated') return 'updated';
  if (row['Match Type'] === 'hubspot-only') return 'hubspot_only';
  return 'matched_no_changes';
}

const FILTER_CONFIG: Record<FilterCategory, { label: string; color: string; bgColor: string; borderColor: string; description: string }> = {
  new_scraped: {
    label: 'New Scraped',
    color: 'text-amber-700 dark:text-amber-300',
    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
    borderColor: 'border-amber-200 dark:border-amber-800/40',
    description: 'Only in CRM — will be added to HubSpot',
  },
  updated: {
    label: 'Updated',
    color: 'text-green-700 dark:text-green-300',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    borderColor: 'border-green-200 dark:border-green-800/40',
    description: 'Matched — blank fields will be filled',
  },
  matched_no_changes: {
    label: 'Matched - No Changes',
    color: 'text-indigo-700 dark:text-indigo-300',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
    borderColor: 'border-indigo-200 dark:border-indigo-800/40',
    description: 'Found in both files — already complete',
  },
  hubspot_only: {
    label: 'HubSpot Only',
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800/40',
    description: 'Only in HubSpot — not in CRM data',
  },
};

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'record_group', label: 'Record Group Priority' },
  { value: 'company_asc', label: 'Company A → Z' },
  { value: 'company_desc', label: 'Company Z → A' },
  { value: 'email_present', label: 'Has Email First' },
  { value: 'email_missing', label: 'Missing Email First' },
];

const RECORD_GROUP_SORT_PRIORITY: Record<string, number> = {
  new_scraped: 0,
  updated: 1,
  matched_no_changes: 2,
  hubspot_only: 3,
};

const PAGE_SIZE = 25;

// ─── File Upload ───────────────────────────────────────────────────────────

function FileDropZone({
  label,
  description,
  slot,
  onFile,
  onClear,
}: {
  label: string;
  description: string;
  slot: UploadSlot;
  onFile: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.name.endsWith('.csv')) onFile(file);
    },
    [onFile]
  );

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        {slot.file ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/40 border border-border/60">
              <div className="flex items-center gap-2 min-w-0">
                {slot.error ? (
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500 shrink-0" />
                ) : (
                  <CheckCircleIcon className="h-5 w-5 text-green-500 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{slot.file.name}</p>
                  {slot.error ? (
                    <p className="text-xs text-red-500">{slot.error}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {slot.rows.length.toLocaleString()} rows &middot; {slot.columns.length} columns
                    </p>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={onClear} className="shrink-0">
                Remove
              </Button>
            </div>
            {!slot.error && slot.columns.length > 0 && (
              <details className="text-xs text-muted-foreground">
                <summary className="cursor-pointer hover:text-foreground">Columns detected</summary>
                <div className="mt-1 flex flex-wrap gap-1">
                  {slot.columns.map((col) => (
                    <span key={col} className="px-1.5 py-0.5 rounded bg-muted border border-border/60 text-xs">
                      {col}
                    </span>
                  ))}
                </div>
              </details>
            )}
          </div>
        ) : (
          <div
            className={`flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed transition-colors cursor-pointer ${
              dragging
                ? 'border-primary bg-primary/5'
                : 'border-border/60 hover:border-primary/50 hover:bg-muted/20'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <DocumentArrowUpIcon className="h-6 w-6 text-muted-foreground" />
            <p className="text-xs text-center text-muted-foreground">
              Drag & drop CSV, or <span className="text-primary font-medium">browse</span>
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Summary Dashboard ─────────────────────────────────────────────────────

function ResultsDashboard({ result }: { result: MergeResult }) {
  const { stats, diffs } = result;
  const matched = stats.matchedByEmail + stats.matchedByName;
  const newContacts = stats.crmTotal - matched;
  const total = stats.hubspotTotal + newContacts;
  const withChanges = diffs.filter((d) => d.changes.length > 0).length;
  const noChanges = diffs.filter((d) => d.changes.length === 0).length;

  return (
    <div className="space-y-4">
      {/* Section 1: Your Files */}
      <Card className="border-border bg-card">
        <CardContent className="pt-5 pb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Your Files</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/10 border border-blue-200/60 dark:border-blue-800/30 text-center">
              <p className="text-3xl font-bold tabular-nums text-blue-600">{stats.hubspotTotal.toLocaleString()}</p>
              <p className="text-sm text-blue-700 dark:text-blue-400 font-medium mt-1">HubSpot Contacts</p>
            </div>
            <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/10 border border-purple-200/60 dark:border-purple-800/30 text-center">
              <p className="text-3xl font-bold tabular-nums text-purple-600">{stats.crmTotal.toLocaleString()}</p>
              <p className="text-sm text-purple-700 dark:text-purple-400 font-medium mt-1">CRM Contacts</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: What We Found */}
      <Card className="border-border bg-card">
        <CardContent className="pt-5 pb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">What We Found</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-200/60 dark:border-indigo-800/30 text-center">
              <p className="text-3xl font-bold tabular-nums text-indigo-600">{matched.toLocaleString()}</p>
              <p className="text-sm text-indigo-700 dark:text-indigo-400 font-medium mt-1">Same Person in Both</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.matchedByEmail > 0 && <>{stats.matchedByEmail} matched by email</>}
                {stats.matchedByEmail > 0 && stats.matchedByName > 0 && ', '}
                {stats.matchedByName > 0 && <>{stats.matchedByName} matched by name</>}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/60 dark:border-amber-800/30 text-center">
              <p className="text-3xl font-bold tabular-nums text-amber-600">{newContacts.toLocaleString()}</p>
              <p className="text-sm text-amber-700 dark:text-amber-400 font-medium mt-1">New People</p>
              <p className="text-xs text-muted-foreground mt-1">Only in CRM, not in HubSpot</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: What Will Happen */}
      <Card className="border-border bg-card">
        <CardContent className="pt-5 pb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">What Happens After Import</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/60 dark:border-amber-800/30 text-center">
              <p className="text-2xl font-bold tabular-nums text-amber-600">{newContacts.toLocaleString()}</p>
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mt-1">Added to HubSpot</p>
            </div>
            <div className="p-3 rounded-xl bg-green-50/50 dark:bg-green-950/10 border border-green-200/60 dark:border-green-800/30 text-center">
              <p className="text-2xl font-bold tabular-nums text-green-600">{withChanges.toLocaleString()}</p>
              <p className="text-xs font-medium text-green-700 dark:text-green-400 mt-1">Updated</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{stats.fieldsFilledIn} fields filled</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/30 border border-border/60 text-center">
              <p className="text-2xl font-bold tabular-nums text-muted-foreground">{(noChanges + stats.hubspotOnly).toLocaleString()}</p>
              <p className="text-xs font-medium text-muted-foreground mt-1">No Changes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Total — the math */}
      <Card className="border-border bg-card">
        <CardContent className="py-4">
          <div className="flex items-center justify-center gap-2 flex-wrap text-sm">
            <span className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 font-bold tabular-nums text-blue-600">
              {stats.hubspotTotal.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">HubSpot</span>
            <span className="text-lg font-bold text-muted-foreground">+</span>
            <span className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 font-bold tabular-nums text-amber-600">
              {newContacts.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">new</span>
            <span className="text-lg font-bold text-muted-foreground">=</span>
            <span className="px-4 py-2 rounded-lg bg-foreground text-background font-bold tabular-nums text-base">
              {total.toLocaleString()}
            </span>
            <span className="text-sm font-semibold text-foreground">total in merged file</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Filter & Sort Toolbar ────────────────────────────────────────────────

function FilterSortToolbar({
  rows,
  activeFilters,
  onToggleFilter,
  onResetFilters,
  sortOption,
  onSortChange,
  filteredCount,
}: {
  rows: MergedRow[];
  activeFilters: Set<FilterCategory>;
  onToggleFilter: (cat: FilterCategory) => void;
  onResetFilters: () => void;
  sortOption: SortOption;
  onSortChange: (opt: SortOption) => void;
  filteredCount: number;
}) {
  // Compute counts per category
  const counts = useMemo(() => {
    const c: Record<FilterCategory, number> = { new_scraped: 0, updated: 0, matched_no_changes: 0, hubspot_only: 0 };
    for (const row of rows) {
      c[getFilterCategory(row)]++;
    }
    return c;
  }, [rows]);

  const allActive = activeFilters.size === 4;

  return (
    <Card className="border-border bg-card">
      <CardContent className="py-4">
        <div className="flex flex-col gap-3">
          {/* Row 1: Filter pills + sort */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide shrink-0">Filter</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground shrink-0 mr-1">Sort by</span>
              <Select value={sortOption} onValueChange={(v) => onSortChange(v as SortOption)}>
                <SelectTrigger size="sm" className="h-8 text-xs min-w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Filter pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Show All pill */}
            <button
              onClick={onResetFilters}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                allActive
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted/60'
              }`}
            >
              Show All
              <span className={`tabular-nums ${allActive ? 'text-background/70' : 'text-muted-foreground/60'}`}>
                {rows.length.toLocaleString()}
              </span>
            </button>

            <span className="w-px h-5 bg-border/60" />

            {/* Category pills */}
            {(Object.keys(FILTER_CONFIG) as FilterCategory[]).map((cat) => {
              const cfg = FILTER_CONFIG[cat];
              const isActive = activeFilters.has(cat);
              const count = counts[cat];
              if (count === 0) return null;
              return (
                <button
                  key={cat}
                  onClick={() => onToggleFilter(cat)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? `${cfg.bgColor} ${cfg.color} ${cfg.borderColor}`
                      : 'bg-muted/20 text-muted-foreground/50 border-border/40 line-through decoration-muted-foreground/30'
                  }`}
                  title={cfg.description}
                >
                  {cfg.label}
                  <span className={`tabular-nums ${isActive ? 'opacity-70' : 'opacity-40'}`}>
                    {count.toLocaleString()}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Row 3: Result count */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-foreground tabular-nums">{filteredCount.toLocaleString()}</span>
              {filteredCount !== rows.length && (
                <> of <span className="tabular-nums">{rows.length.toLocaleString()}</span></>
              )} records
            </p>
            {!allActive && (
              <button
                onClick={onResetFilters}
                className="text-xs text-primary hover:underline cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Data Table ───────────────────────────────────────────────────────────

function RecordGroupBadge({ row }: { row: MergedRow }) {
  const cat = getFilterCategory(row);
  const cfg = FILTER_CONFIG[cat];
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${cfg.bgColor} ${cfg.color} ${cfg.borderColor} border whitespace-nowrap`}>
      {cfg.label}
    </span>
  );
}

function MergedDataTable({
  rows,
  page,
  onPageChange,
}: {
  rows: MergedRow[];
  page: number;
  onPageChange: (p: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(page, totalPages);
  const startIdx = (safeCurrentPage - 1) * PAGE_SIZE;
  const pageRows = rows.slice(startIdx, startIdx + PAGE_SIZE);

  if (rows.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="py-12 text-center">
          <p className="text-sm text-muted-foreground">No records match the current filters.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40">
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground w-[140px]">Record Group</th>
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Email</th>
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Job Title</th>
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Company</th>
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground w-[80px]">State</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, idx) => {
                const name = [row['First Name'], row['Last Name']].filter(Boolean).join(' ') || '-';
                const email = row['Email'] || '';
                return (
                  <tr
                    key={startIdx + idx}
                    className={`border-b border-border/30 hover:bg-muted/20 transition-colors ${
                      idx % 2 === 0 ? '' : 'bg-muted/10'
                    }`}
                  >
                    <td className="px-3 py-2">
                      <RecordGroupBadge row={row} />
                    </td>
                    <td className="px-3 py-2 font-medium text-foreground truncate max-w-[160px]" title={name}>
                      {name}
                    </td>
                    <td className="px-3 py-2 truncate max-w-[200px]" title={email}>
                      {email ? (
                        <span className="text-foreground">{email}</span>
                      ) : (
                        <span className="text-muted-foreground/50 italic">no email</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground truncate max-w-[160px]" title={row['Job Title']}>
                      {row['Job Title'] || '-'}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground truncate max-w-[200px]" title={row['Company name']}>
                      {row['Company name'] || '-'}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {row['State - Dropdown (COMPANY)'] || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/60">
            <p className="text-xs text-muted-foreground tabular-nums">
              {startIdx + 1}–{Math.min(startIdx + PAGE_SIZE, rows.length)} of {rows.length.toLocaleString()}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(safeCurrentPage - 1)}
                disabled={safeCurrentPage <= 1}
                className="h-7 w-7 p-0"
              >
                <ChevronLeftIcon className="w-3.5 h-3.5" />
              </Button>
              {generatePageNumbers(safeCurrentPage, totalPages).map((p, i) =>
                p === null ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-xs text-muted-foreground">...</span>
                ) : (
                  <Button
                    key={p}
                    variant={p === safeCurrentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange(p)}
                    className="h-7 min-w-[28px] px-2 text-xs tabular-nums"
                  >
                    {p}
                  </Button>
                )
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(safeCurrentPage + 1)}
                disabled={safeCurrentPage >= totalPages}
                className="h-7 w-7 p-0"
              >
                <ChevronRightIcon className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Generate page numbers with ellipsis for pagination. */
function generatePageNumbers(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | null)[] = [];
  if (current <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push(null, total);
  } else if (current >= total - 3) {
    pages.push(1, null);
    for (let i = total - 4; i <= total; i++) pages.push(i);
  } else {
    pages.push(1, null, current - 1, current, current + 1, null, total);
  }
  return pages;
}

// ─── Section: Contacts that will be UPDATED ────────────────────────────────

function UpdatedContactsSection({ diffs }: { diffs: MatchedRecordDiff[] }) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [showAll, setShowAll] = useState(false);
  const LIMIT = 25;
  const visible = showAll ? diffs : diffs.slice(0, LIMIT);

  if (diffs.length === 0) return null;

  const toggleExpand = (idx: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  return (
    <Card className="border-green-200 dark:border-green-800/50 bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-green-500" />
          <CardTitle className="text-sm font-semibold text-foreground">
            {diffs.length} contacts getting missing info filled in
          </CardTitle>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          These people are already in HubSpot, but some fields are blank (like phone number or address). We&apos;ll fill in what&apos;s missing. Click any row to see exactly what gets added.
        </p>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border/60 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[80px_1fr_1fr_1fr_60px] gap-0 text-xs font-medium text-muted-foreground bg-muted/40 border-b border-border/60">
            <div className="px-3 py-2">Found By</div>
            <div className="px-3 py-2">Name</div>
            <div className="px-3 py-2">Parish / Company</div>
            <div className="px-3 py-2">Matched Using</div>
            <div className="px-3 py-2 text-right">Filling</div>
          </div>

          {/* Table rows */}
          {visible.map((diff, idx) => {
            const isOpen = expanded.has(idx);
            return (
              <div key={idx}>
                <div
                  className={`grid grid-cols-[80px_1fr_1fr_1fr_60px] gap-0 text-xs cursor-pointer transition-colors ${
                    isOpen ? 'bg-green-50/50 dark:bg-green-900/10' : 'hover:bg-muted/20'
                  } ${idx > 0 ? 'border-t border-border/40' : ''}`}
                  onClick={() => toggleExpand(idx)}
                >
                  <div className="px-3 py-2.5">
                    <MatchBadge type={diff.matchType} />
                  </div>
                  <div className="px-3 py-2.5 font-medium text-foreground truncate">{diff.hubspotName}</div>
                  <div className="px-3 py-2.5 text-muted-foreground truncate">{diff.company}</div>
                  <div className="px-3 py-2.5 text-muted-foreground truncate">{diff.matchKey}</div>
                  <div className="px-3 py-2.5 text-right">
                    <span className="inline-block px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium text-[10px]">
                      +{diff.changes.length}
                    </span>
                  </div>
                </div>

                {/* Expanded detail: before → after */}
                {isOpen && (
                  <div className="bg-green-50/30 dark:bg-green-900/5 border-t border-green-200/50 dark:border-green-800/30">
                    <div className="px-4 py-2">
                      <p className="text-[10px] uppercase font-semibold tracking-wide text-muted-foreground mb-2">
                        Missing info that will be filled in
                      </p>
                      <table className="w-full text-xs">
                        <thead>
                          <tr>
                            <th className="text-left font-medium text-muted-foreground pb-1 w-[150px]">Field</th>
                            <th className="text-left font-medium text-red-400 pb-1">Currently</th>
                            <th className="text-left pb-1 w-8"></th>
                            <th className="text-left font-medium text-green-600 pb-1">After Import</th>
                          </tr>
                        </thead>
                        <tbody>
                          {diff.changes.map((change, ci) => (
                            <tr key={ci}>
                              <td className="py-1 font-medium text-muted-foreground">{change.column}</td>
                              <td className="py-1">
                                <span className="inline-block px-2 py-0.5 rounded bg-red-50 dark:bg-red-900/20 text-red-400 italic border border-red-100 dark:border-red-800/30">
                                  {change.before || 'empty'}
                                </span>
                              </td>
                              <td className="py-1 text-center text-muted-foreground">&rarr;</td>
                              <td className="py-1">
                                <span className="inline-block px-2 py-0.5 rounded bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-medium border border-green-100 dark:border-green-800/30">
                                  {change.after}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {diffs.length > LIMIT && (
          <Button variant="outline" size="sm" onClick={() => setShowAll(!showAll)} className="w-full mt-3">
            {showAll ? 'Show less' : `Show all ${diffs.length} updated contacts`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Section: Matched contacts with NO changes ────────────────────────────

function MatchedNoChangesSection({ diffs }: { diffs: MatchedRecordDiff[] }) {
  const [showAll, setShowAll] = useState(false);
  const LIMIT = 30;
  const visible = showAll ? diffs : diffs.slice(0, LIMIT);

  if (diffs.length === 0) return null;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CheckCircleIcon className="w-4 h-4 text-muted-foreground" />
          <CardTitle className="text-sm font-semibold text-foreground">
            {diffs.length} contacts already have everything
          </CardTitle>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          We found these people in both files, but HubSpot already has all their info. Nothing will change for them.
        </p>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border/60 overflow-hidden">
          <div className="grid grid-cols-[80px_1fr_1fr_1fr] gap-0 text-xs font-medium text-muted-foreground bg-muted/40 border-b border-border/60">
            <div className="px-3 py-2">Found By</div>
            <div className="px-3 py-2">Name</div>
            <div className="px-3 py-2">Parish / Company</div>
            <div className="px-3 py-2">Matched Using</div>
          </div>
          {visible.map((diff, idx) => (
            <div
              key={idx}
              className={`grid grid-cols-[80px_1fr_1fr_1fr] gap-0 text-xs ${idx > 0 ? 'border-t border-border/40' : ''}`}
            >
              <div className="px-3 py-2"><MatchBadge type={diff.matchType} /></div>
              <div className="px-3 py-2 text-foreground truncate">{diff.hubspotName}</div>
              <div className="px-3 py-2 text-muted-foreground truncate">{diff.company}</div>
              <div className="px-3 py-2 text-muted-foreground truncate">{diff.matchKey}</div>
            </div>
          ))}
        </div>
        {diffs.length > LIMIT && (
          <Button variant="outline" size="sm" onClick={() => setShowAll(!showAll)} className="w-full mt-3">
            {showAll ? 'Show less' : `Show all ${diffs.length} matched contacts`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Shared badge ──────────────────────────────────────────────────────────

function MatchBadge({ type }: { type: string }) {
  const isEmail = type === 'email';
  return (
    <span
      className={`shrink-0 inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
        isEmail
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
          : 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
      }`}
    >
      {isEmail ? 'Email' : 'Name'}
    </span>
  );
}

// ─── Sorting logic ────────────────────────────────────────────────────────

function applySortToRows(rows: MergedRow[], sortOption: SortOption): MergedRow[] {
  const sorted = [...rows];
  switch (sortOption) {
    case 'record_group':
      sorted.sort((a, b) => {
        const pa = RECORD_GROUP_SORT_PRIORITY[getFilterCategory(a)] ?? 9;
        const pb = RECORD_GROUP_SORT_PRIORITY[getFilterCategory(b)] ?? 9;
        return pa - pb;
      });
      break;
    case 'company_asc':
      sorted.sort((a, b) => (a['Company name'] || '').localeCompare(b['Company name'] || ''));
      break;
    case 'company_desc':
      sorted.sort((a, b) => (b['Company name'] || '').localeCompare(a['Company name'] || ''));
      break;
    case 'email_present':
      sorted.sort((a, b) => {
        const aHas = a['Email']?.trim() ? 0 : 1;
        const bHas = b['Email']?.trim() ? 0 : 1;
        return aHas - bHas;
      });
      break;
    case 'email_missing':
      sorted.sort((a, b) => {
        const aHas = a['Email']?.trim() ? 1 : 0;
        const bHas = b['Email']?.trim() ? 1 : 0;
        return aHas - bHas;
      });
      break;
  }
  return sorted;
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function CsvMergePage() {
  const [hubspot, setHubspot] = useState<UploadSlot>(EMPTY_SLOT);
  const [crm, setCrm] = useState<UploadSlot>(EMPTY_SLOT);
  const [mergeResult, setMergeResult] = useState<MergeResult | null>(null);
  const [merging, setMerging] = useState(false);

  // Filter & sort state
  const ALL_FILTERS = new Set<FilterCategory>(['new_scraped', 'updated', 'matched_no_changes', 'hubspot_only']);
  const [activeFilters, setActiveFilters] = useState<Set<FilterCategory>>(new Set(ALL_FILTERS));
  const [sortOption, setSortOption] = useState<SortOption>('record_group');
  const [tablePage, setTablePage] = useState(1);

  const handleToggleFilter = useCallback((cat: FilterCategory) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        // Don't allow deselecting all filters
        if (next.size <= 1) return prev;
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
    setTablePage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setActiveFilters(new Set(ALL_FILTERS));
    setTablePage(1);
  }, []);

  // Compute filtered + sorted rows
  const filteredRows = useMemo(() => {
    if (!mergeResult) return [];
    const filtered = mergeResult.rows.filter((row) => activeFilters.has(getFilterCategory(row)));
    return applySortToRows(filtered, sortOption);
  }, [mergeResult, activeFilters, sortOption]);

  const handleFile = useCallback((setter: typeof setHubspot) => async (file: File) => {
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (rows.length === 0) {
        setter({ file, rows: [], columns: [], error: 'No data rows found in CSV' });
        return;
      }
      const columns = Object.keys(rows[0]);
      setter({ file, rows, columns, error: null });
      setMergeResult(null);
    } catch (err) {
      setter({ file, rows: [], columns: [], error: err instanceof Error ? err.message : 'Failed to parse CSV' });
    }
  }, []);

  const handleMerge = useCallback(() => {
    if (hubspot.rows.length === 0 || crm.rows.length === 0) return;
    setMerging(true);
    setTimeout(() => {
      try {
        const result = mergeCsvs(hubspot.rows, crm.rows);
        setMergeResult(result);
        // Reset filter/sort/page on new merge
        setActiveFilters(new Set(ALL_FILTERS));
        setSortOption('record_group');
        setTablePage(1);
      } catch (err) {
        console.error('Merge failed:', err);
      } finally {
        setMerging(false);
      }
    }, 50);
  }, [hubspot.rows, crm.rows]);

  const handleDownload = useCallback(() => {
    if (!mergeResult) return;
    const rowsToExport = filteredRows;
    if (rowsToExport.length === 0) return;
    const csv = mergedRowsToCsv(rowsToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const isFiltered = activeFilters.size < 4;
    const suffix = isFiltered ? '_filtered' : '';
    a.download = `merged_contacts${suffix}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [mergeResult, filteredRows, activeFilters]);

  const handleReset = useCallback(() => {
    setHubspot(EMPTY_SLOT);
    setCrm(EMPTY_SLOT);
    setMergeResult(null);
    setActiveFilters(new Set(ALL_FILTERS));
    setSortOption('record_group');
    setTablePage(1);
  }, []);

  const canMerge = hubspot.rows.length > 0 && crm.rows.length > 0 && !hubspot.error && !crm.error;
  const isFiltered = activeFilters.size < 4;

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Preview Before Import</h1>
        <p className="text-sm text-muted-foreground mt-1">Upload both files to see exactly what will happen in HubSpot before you make any changes.</p>
      </div>

      {/* Upload area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FileDropZone
          label="Step 1: Your HubSpot File"
          description="Export this from HubSpot. These are your current contacts — their data is always kept safe."
          slot={hubspot}
          onFile={handleFile(setHubspot)}
          onClear={() => { setHubspot(EMPTY_SLOT); setMergeResult(null); }}
        />
        <FileDropZone
          label="Step 2: Our CRM File"
          description="The enriched contacts from Augustine. New people will be added and missing info will be filled in."
          slot={crm}
          onFile={handleFile(setCrm)}
          onClear={() => { setCrm(EMPTY_SLOT); setMergeResult(null); }}
        />
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button onClick={handleMerge} disabled={!canMerge || merging} className="gap-2">
          <ArrowPathIcon className={`w-4 h-4 ${merging ? 'animate-spin' : ''}`} />
          {merging ? 'Analyzing...' : 'Preview Changes'}
        </Button>
        {mergeResult && (
          <Button onClick={handleDownload} variant="outline" className="gap-2" disabled={filteredRows.length === 0}>
            <DocumentArrowDownIcon className="w-4 h-4" />
            {isFiltered
              ? `Export Filtered (${filteredRows.length.toLocaleString()} contacts)`
              : `Download Ready-to-Import File (${mergeResult.stats.outputTotal.toLocaleString()} contacts)`
            }
          </Button>
        )}
        {(hubspot.file || crm.file) && (
          <Button onClick={handleReset} variant="ghost" size="sm" className="ml-auto">
            Reset
          </Button>
        )}
      </div>

      {/* Results */}
      {mergeResult && (
        <>
          <ResultsDashboard result={mergeResult} />

          {/* Filter & Sort Toolbar */}
          <FilterSortToolbar
            rows={mergeResult.rows}
            activeFilters={activeFilters}
            onToggleFilter={handleToggleFilter}
            onResetFilters={handleResetFilters}
            sortOption={sortOption}
            onSortChange={(opt) => { setSortOption(opt); setTablePage(1); }}
            filteredCount={filteredRows.length}
          />

          {/* Merged Data Table */}
          <MergedDataTable
            rows={filteredRows}
            page={tablePage}
            onPageChange={setTablePage}
          />

          {/* Detailed diff sections — only show when relevant filter is active */}
          {activeFilters.has('updated') && (
            <UpdatedContactsSection
              diffs={mergeResult.diffs.filter((d) => d.changes.length > 0)}
            />
          )}

          {activeFilters.has('matched_no_changes') && (
            <MatchedNoChangesSection
              diffs={mergeResult.diffs.filter((d) => d.changes.length === 0)}
            />
          )}
        </>
      )}
    </div>
  );
}
