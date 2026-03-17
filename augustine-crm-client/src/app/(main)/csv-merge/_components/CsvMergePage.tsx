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

type UploadSlot = {
  file: File | null;
  rows: Record<string, string>[];
  columns: string[];
  error: string | null;
};

const EMPTY_SLOT: UploadSlot = { file: null, rows: [], columns: [], error: null };

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

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFile(file);
      e.target.value = '';
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
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <DocumentArrowUpIcon className="h-6 w-6 text-muted-foreground" />
            <p className="text-xs text-center text-muted-foreground">
              Drag & drop CSV, or <span className="text-primary font-medium">browse</span>
            </p>
            <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={handleFileInput} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatsCard({ stats }: { stats: MergeResult['stats'] }) {
  const items = [
    { label: 'HubSpot contacts', value: stats.hubspotTotal, color: 'text-blue-600' },
    { label: 'CRM contacts', value: stats.crmTotal, color: 'text-purple-600' },
    { label: 'Matched by email', value: stats.matchedByEmail, color: 'text-green-600' },
    { label: 'Matched by name + institution', value: stats.matchedByName, color: 'text-green-500' },
    { label: 'New from CRM (net-new)', value: stats.newFromCrm, color: 'text-amber-600' },
    { label: 'HubSpot only (no CRM match)', value: stats.hubspotOnly, color: 'text-slate-500' },
    { label: 'Blank fields filled in', value: stats.fieldsFilledIn, color: 'text-teal-600' },
    { label: 'Total output rows', value: stats.outputTotal, color: 'text-foreground font-bold' },
  ];

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Merge Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.label} className="space-y-1">
              <p className={`text-2xl tabular-nums ${item.color}`}>{item.value.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

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
    // Use setTimeout to let React render the loading state
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
      <div>
        <h1 className="text-xl font-semibold text-foreground whitespace-nowrap">Dry Run Tool</h1>
        <p className="text-sm text-muted-foreground mt-1">Upload your HubSpot export and CRM export to produce a merged CSV ready for HubSpot import. Existing HubSpot data is preserved — only blank fields get filled from CRM data.</p>
      </div>

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

      <div className="flex items-center gap-3 flex-wrap">
        <Button
          onClick={handleMerge}
          disabled={!canMerge || merging}
          className="gap-2"
        >
          <ArrowPathIcon className={`w-4 h-4 ${merging ? 'animate-spin' : ''}`} />
          {merging ? 'Merging...' : 'Merge CSVs'}
        </Button>
        {mergeResult && (
          <Button onClick={handleDownload} variant="outline" className="gap-2">
            <DocumentArrowDownIcon className="w-4 h-4" />
            Download Merged CSV ({mergeResult.stats.outputTotal.toLocaleString()} rows)
          </Button>
        )}
        <Button onClick={handleReset} variant="ghost" size="sm" className="ml-auto">
          Reset
        </Button>
      </div>

      {mergeResult && <StatsCard stats={mergeResult.stats} />}

      {mergeResult && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Merge Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="space-y-1.5">
              <div className="flex items-start gap-2">
                <span className="inline-block w-2 h-2 mt-1.5 rounded-full bg-green-500 shrink-0" />
                <span>
                  <strong>{mergeResult.stats.matchedByEmail}</strong> matched by email +{' '}
                  <strong>{mergeResult.stats.matchedByName}</strong> matched by name+institution ={' '}
                  <strong>{mergeResult.stats.matchedByEmail + mergeResult.stats.matchedByName}</strong> total
                  overlapping contacts. HubSpot data preserved, <strong>{mergeResult.stats.fieldsFilledIn}</strong> blank
                  fields filled from CRM.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="inline-block w-2 h-2 mt-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>
                  <strong>{mergeResult.stats.newFromCrm}</strong> net-new contacts from CRM (not in HubSpot).
                  These will be created as new contacts on import.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="inline-block w-2 h-2 mt-1.5 rounded-full bg-slate-400 shrink-0" />
                <span>
                  <strong>{mergeResult.stats.hubspotOnly}</strong> contacts only in HubSpot (no CRM match).
                  Included unchanged in output.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {mergeResult && mergeResult.diffs.length > 0 && (
        <ChangesPreview diffs={mergeResult.diffs} />
      )}
    </div>
  );
}

// ─── Changes Preview ───────────────────────────────────────────────────────

function ChangesPreview({ diffs }: { diffs: MatchedRecordDiff[] }) {
  const [showAll, setShowAll] = useState(false);
  const withChanges = diffs.filter((d) => d.changes.length > 0);
  const noChanges = diffs.filter((d) => d.changes.length === 0);
  const visible = showAll ? withChanges : withChanges.slice(0, 20);

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2 flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Matched Records — Field Changes Preview
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            {withChanges.length} record{withChanges.length !== 1 ? 's' : ''} with blank fields filled
            {noChanges.length > 0 && (
              <> &middot; {noChanges.length} matched with no changes needed</>
            )}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {withChanges.length === 0 ? (
          <p className="text-sm text-muted-foreground">All matched records already had complete data — nothing to fill.</p>
        ) : (
          <div className="space-y-3">
            {visible.map((diff, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-border/60 overflow-hidden"
              >
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border/60">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      diff.matchType === 'email'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                    }`}
                  >
                    {diff.matchType}
                  </span>
                  <span className="text-xs font-medium text-foreground truncate">
                    {diff.hubspotName}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {diff.company}
                  </span>
                  <span className="ml-auto text-[10px] text-muted-foreground whitespace-nowrap">
                    {diff.changes.length} field{diff.changes.length !== 1 ? 's' : ''} filled
                  </span>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/20">
                      <th className="px-3 py-1.5 text-left font-medium text-muted-foreground w-[140px]">Field</th>
                      <th className="px-3 py-1.5 text-left font-medium text-red-500">Before (HubSpot)</th>
                      <th className="px-3 py-1.5 text-left font-medium text-green-600">After (Merged)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diff.changes.map((change, ci) => (
                      <tr key={ci} className="border-t border-border/40">
                        <td className="px-3 py-1.5 font-medium text-muted-foreground">{change.column}</td>
                        <td className="px-3 py-1.5 text-red-400 italic">
                          {change.before || '(empty)'}
                        </td>
                        <td className="px-3 py-1.5 text-green-600 font-medium">
                          {change.after}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

            {withChanges.length > 20 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className="w-full"
              >
                {showAll
                  ? 'Show less'
                  : `Show all ${withChanges.length} records with changes`}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
