'use client';

import { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Trophy, XCircle, Loader2 } from 'lucide-react';
import type { ClosedOutcome } from '@/services/journey/useJourneys';

interface MarkJourneyClosedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  outcome: ClosedOutcome | null;
  /** Journey label for context inside the dialog. */
  journeyLabel?: string;
  onConfirm: (payload: { lostReason?: string; note?: string }) => void;
  loading?: boolean;
}

const LOST_REASONS = [
  'Not a fit (wrong ICP)',
  'Budget',
  'Timing',
  'Went with competitor',
  'No response after follow-ups',
  'Other',
];

export default function MarkJourneyClosedDialog({
  open,
  onOpenChange,
  outcome,
  journeyLabel,
  onConfirm,
  loading,
}: MarkJourneyClosedDialogProps) {
  // '' = nothing selected yet — forces the user to pick a reason on Lost.
  const [lostReason, setLostReason] = useState<string>('');
  const [note, setNote] = useState('');

  // Reset inputs whenever the dialog opens or the outcome changes so stale
  // reasons don't carry across journeys.
  useEffect(() => {
    if (!open) {
      setLostReason('');
      setNote('');
    }
  }, [open, outcome]);

  if (!outcome) return null;

  const isWon = outcome === 'Closed-Won';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-130">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                isWon ? 'bg-emerald-100 dark:bg-emerald-500/15' : 'bg-rose-100 dark:bg-rose-500/15'
              }`}
            >
              {isWon ? (
                <Trophy className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              )}
            </div>
            <AlertDialogTitle className="text-left">
              {isWon ? 'Mark journey as Closed-Won?' : 'Mark journey as Closed-Lost?'}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2 text-left text-sm leading-relaxed">
            {isWon ? (
              <>
                You&apos;re about to mark{' '}
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {journeyLabel ?? 'this journey'}
                </span>{' '}
                as <span className="font-semibold text-emerald-700 dark:text-emerald-400">Closed-Won</span>.
                This stops the outreach pipeline for this lead and records the change
                in the activity log.
              </>
            ) : (
              <>
                You&apos;re about to mark{' '}
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {journeyLabel ?? 'this journey'}
                </span>{' '}
                as <span className="font-semibold text-rose-700 dark:text-rose-400">Closed-Lost</span>.
                This stops the outreach pipeline for this lead and records the change
                in the activity log.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Lost reason dropdown — required for Closed-Lost */}
        {!isWon && (
          <div className="space-y-1.5">
            <label
              htmlFor="lost-reason-select"
              className="block text-xs font-medium text-slate-700 dark:text-slate-200"
            >
              Reason for loss <span className="text-rose-600">*</span>
            </label>
            <select
              id="lost-reason-select"
              value={lostReason}
              onChange={(e) => setLostReason(e.target.value)}
              disabled={loading}
              required
              aria-invalid={lostReason ? 'false' : 'true'}
              className={`w-full rounded-md border bg-card px-3 py-2 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-100 disabled:opacity-50 disabled:cursor-not-allowed ${
                lostReason
                  ? 'border-border text-slate-800 dark:text-slate-200 focus:border-rose-500'
                  : 'border-rose-300 text-slate-400 dark:text-slate-500 focus:border-rose-500'
              }`}
            >
              <option value="" disabled>
                Select a reason…
              </option>
              {LOST_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {!lostReason && (
              <p className="text-[11px] text-rose-600 dark:text-rose-400">
                Pick a reason so the team has context in the activity log.
              </p>
            )}
          </div>
        )}

        {/* Optional note — Closed-Won only. Lost is closed with reason alone. */}
        {isWon && (
          <div className="space-y-1.5">
            <label
              htmlFor="closure-note"
              className="block text-xs font-medium text-slate-700 dark:text-slate-200"
            >
              Additional note{' '}
              <span className="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
            </label>
            <Textarea
              id="closure-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Signed contract today, kickoff scheduled for next week."
              disabled={loading}
              className="min-h-20"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              This note is saved to the journey&apos;s activity log so the team
              has context later.
            </p>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading || (!isWon && !lostReason)}
            onClick={(e) => {
              e.preventDefault();
              // Defensive guard — button is already disabled but double-check
              // before firing the mutation.
              if (!isWon && !lostReason) return;
              onConfirm({
                lostReason: isWon ? undefined : lostReason,
                note: isWon ? note.trim() || undefined : undefined,
              });
            }}
            className={`inline-flex items-center gap-2 text-white cursor-pointer disabled:cursor-not-allowed ${
              isWon
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading
              ? 'Saving…'
              : isWon
                ? 'Confirm · Mark as Won'
                : 'Confirm · Mark as Lost'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
