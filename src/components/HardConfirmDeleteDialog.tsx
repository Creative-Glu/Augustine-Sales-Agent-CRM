'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
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
import { Input } from '@/components/ui/input';

interface HardConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  warningPoints?: string[];
  confirmWord?: string;
  onConfirm: () => void;
  loading?: boolean;
}

export default function HardConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  warningPoints = [],
  confirmWord = 'DELETE',
  onConfirm,
  loading,
}: HardConfirmDeleteDialogProps) {
  const [input, setInput] = useState('');

  // Clear the input each time the dialog opens or closes so users can't
  // accidentally re-trigger a delete by reopening the same dialog.
  useEffect(() => {
    if (!open) setInput('');
  }, [open]);

  const matches = input.trim() === confirmWord;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[480px]">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <AlertDialogTitle className="text-left">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2 text-left text-sm leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {warningPoints.length > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 mt-1">
            <p className="text-xs font-semibold text-red-900 mb-1.5">
              The following will be permanently deleted:
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-xs text-red-800">
              {warningPoints.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] font-medium text-red-700">
              This action cannot be undone.
            </p>
          </div>
        )}

        <div className="space-y-1.5 mt-2">
          <label
            htmlFor="hard-confirm-input"
            className="block text-xs font-medium text-slate-700"
          >
            Type{' '}
            <span className="font-mono font-bold text-red-700 bg-red-50 border border-red-200 rounded px-1.5 py-0.5">
              {confirmWord}
            </span>{' '}
            to confirm:
          </label>
          <Input
            id="hard-confirm-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={confirmWord}
            disabled={loading}
            autoComplete="off"
            className="font-mono"
          />
          {input.length > 0 && !matches && (
            <p className="text-[11px] text-amber-700">
              Doesn&apos;t match — type exactly{' '}
              <span className="font-mono">{confirmWord}</span> (case-sensitive).
            </p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={!matches || loading}
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white disabled:bg-red-300 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
            {loading ? 'Deleting…' : 'Delete permanently'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
