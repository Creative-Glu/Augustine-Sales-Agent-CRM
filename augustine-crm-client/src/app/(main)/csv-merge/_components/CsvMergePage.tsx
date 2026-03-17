'use client';

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import {
  parseCsv,
  mergeCsvs,
  mergedRowsToCsv,
  type MergeResult,
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
  const totalMatched = stats.matchedByEmail + stats.matchedByName;
  const withChanges = diffs.filter((d) => d.changes.length > 0).length;
  const noChanges = diffs.filter((d) => d.changes.length === 0).length;

  return (
    <Card className="border-border bg-card overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground">Dry Run Summary</CardTitle>
        <p className="text-xs text-muted-foreground">Here&apos;s what will happen when you import the merged CSV into HubSpot.</p>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Input counts */}
        <div className="flex gap-6 pb-4 border-b border-border/60">
          <div>
            <p className="text-2xl font-bold tabular-nums text-blue-600">{stats.hubspotTotal.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">contacts in HubSpot</p>
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums text-purple-600">{stats.crmTotal.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">contacts in CRM</p>
          </div>
        </div>

        {/* What will happen — 3 action blocks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* New contacts */}
          <div className="rounded-lg border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/10 p-4">
            <p className="text-2xl font-bold tabular-nums text-amber-600">{stats.newFromCrm.toLocaleString()}</p>
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">New contacts to create</p>
            <p className="text-xs text-muted-foreground mt-1">These people are in our CRM but not in HubSpot. They will be added as new contacts.</p>
          </div>

          {/* Matched & updated */}
          <div className="rounded-lg border border-green-200 dark:border-green-800/50 bg-green-50/50 dark:bg-green-900/10 p-4">
            <p className="text-2xl font-bold tabular-nums text-green-600">{withChanges.toLocaleString()}</p>
            <p className="text-sm font-medium text-green-700 dark:text-green-400">Existing contacts to update</p>
            <p className="text-xs text-muted-foreground mt-1">
              Matched by email ({stats.matchedByEmail}) or name ({stats.matchedByName}).
              <strong className="text-foreground"> {stats.fieldsFilledIn}</strong> blank fields will be filled in.
              No existing data is overwritten.
            </p>
          </div>

          {/* Unchanged */}
          <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
            <p className="text-2xl font-bold tabular-nums text-muted-foreground">{(noChanges + stats.hubspotOnly).toLocaleString()}</p>
            <p className="text-sm font-medium text-muted-foreground">No changes</p>
            <p className="text-xs text-muted-foreground mt-1">
              {noChanges > 0 && <>{noChanges} matched contacts already have complete data. </>}
              {stats.hubspotOnly > 0 && <>{stats.hubspotOnly} HubSpot-only contacts have no CRM match.</>}
            </p>
          </div>
        </div>

        {/* Output total */}
        <div className="flex items-center gap-3 pt-3 border-t border-border/60">
          <p className="text-sm text-muted-foreground">
            Total rows in merged CSV:
            <strong className="text-foreground text-lg ml-2 tabular-nums">{stats.outputTotal.toLocaleString()}</strong>
          </p>
        </div>
      </CardContent>
    </Card>
  );
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
            Contacts Being Updated ({diffs.length})
          </CardTitle>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          These contacts already exist in HubSpot. Only their <strong>empty fields</strong> will be filled with data from our CRM.
          Existing HubSpot data is never overwritten. Click a row to see exactly what changes.
        </p>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border/60 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[80px_1fr_1fr_1fr_60px] gap-0 text-xs font-medium text-muted-foreground bg-muted/40 border-b border-border/60">
            <div className="px-3 py-2">Match</div>
            <div className="px-3 py-2">Contact</div>
            <div className="px-3 py-2">Company</div>
            <div className="px-3 py-2">Matched On</div>
            <div className="px-3 py-2 text-right">Fields</div>
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
                        What will change for this contact
                      </p>
                      <table className="w-full text-xs">
                        <thead>
                          <tr>
                            <th className="text-left font-medium text-muted-foreground pb-1 w-[150px]">Field</th>
                            <th className="text-left font-medium text-red-400 pb-1">Currently in HubSpot</th>
                            <th className="text-left pb-1 w-8"></th>
                            <th className="text-left font-medium text-green-600 pb-1">Will become</th>
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
            Matched — Already Complete ({diffs.length})
          </CardTitle>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          These contacts were found in both HubSpot and CRM, but HubSpot already has all the data.
          Nothing will change for these contacts.
        </p>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border/60 overflow-hidden">
          <div className="grid grid-cols-[80px_1fr_1fr_1fr] gap-0 text-xs font-medium text-muted-foreground bg-muted/40 border-b border-border/60">
            <div className="px-3 py-2">Match</div>
            <div className="px-3 py-2">Contact</div>
            <div className="px-3 py-2">Company</div>
            <div className="px-3 py-2">Matched On</div>
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
  return (
    <span
      className={`shrink-0 inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
        type === 'email'
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
          : 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
      }`}
    >
      {type}
    </span>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function CsvMergePage() {
  const [hubspot, setHubspot] = useState<UploadSlot>(EMPTY_SLOT);
  const [crm, setCrm] = useState<UploadSlot>(EMPTY_SLOT);
  const [mergeResult, setMergeResult] = useState<MergeResult | null>(null);
  const [merging, setMerging] = useState(false);

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
      } catch (err) {
        console.error('Merge failed:', err);
      } finally {
        setMerging(false);
      }
    }, 50);
  }, [hubspot.rows, crm.rows]);

  const handleDownload = useCallback(() => {
    if (!mergeResult) return;
    const csv = mergedRowsToCsv(mergeResult.rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `merged_contacts_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [mergeResult]);

  const handleReset = useCallback(() => {
    setHubspot(EMPTY_SLOT);
    setCrm(EMPTY_SLOT);
    setMergeResult(null);
  }, []);

  const canMerge = hubspot.rows.length > 0 && crm.rows.length > 0 && !hubspot.error && !crm.error;

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dry Run Tool</h1>
        <p className="text-sm text-muted-foreground mt-1">Compare HubSpot and CRM data side-by-side. See exactly what will change before importing.</p>
      </div>

      {/* Upload area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FileDropZone
          label="1. HubSpot Export"
          description="Existing contacts — their data takes priority and is never overwritten."
          slot={hubspot}
          onFile={handleFile(setHubspot)}
          onClear={() => { setHubspot(EMPTY_SLOT); setMergeResult(null); }}
        />
        <FileDropZone
          label="2. CRM Export"
          description="Our enriched data — new contacts added, blank HubSpot fields filled."
          slot={crm}
          onFile={handleFile(setCrm)}
          onClear={() => { setCrm(EMPTY_SLOT); setMergeResult(null); }}
        />
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button onClick={handleMerge} disabled={!canMerge || merging} className="gap-2">
          <ArrowPathIcon className={`w-4 h-4 ${merging ? 'animate-spin' : ''}`} />
          {merging ? 'Analyzing...' : 'Run Dry Run'}
        </Button>
        {mergeResult && (
          <Button onClick={handleDownload} variant="outline" className="gap-2">
            <DocumentArrowDownIcon className="w-4 h-4" />
            Download Merged CSV ({mergeResult.stats.outputTotal.toLocaleString()} rows)
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

          <UpdatedContactsSection
            diffs={mergeResult.diffs.filter((d) => d.changes.length > 0)}
          />

          <MatchedNoChangesSection
            diffs={mergeResult.diffs.filter((d) => d.changes.length === 0)}
          />
        </>
      )}
    </div>
  );
}
