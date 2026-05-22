import { Tag } from 'lucide-react';

interface MeetingNotesSectionProps {
  notes: string;
}

export function MeetingNotesSection({ notes }: MeetingNotesSectionProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-card shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-slate-50 to-blue-50/30 border-b border-slate-200">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 text-slate-600">
          <Tag className="w-3.5 h-3.5" />
        </span>
        <p className="text-xs font-bold text-slate-900">Notes</p>
      </div>
      <div className="p-4">
        <div
          className="rounded-lg border border-slate-100 bg-slate-50/60 p-3 overflow-y-auto"
          style={{ maxHeight: '14rem' }}
        >
          <pre className="whitespace-pre-wrap wrap-break-word font-sans text-[12px] leading-relaxed text-slate-700">
            {notes}
          </pre>
        </div>
      </div>
    </section>
  );
}
