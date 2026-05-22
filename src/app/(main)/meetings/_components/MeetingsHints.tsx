import { Info } from 'lucide-react';
import { MEETINGS_HINTS } from '@/constants/meetings';

export function MeetingsHints() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-violet-200 bg-linear-to-br from-violet-50 via-indigo-50/60 to-blue-50/40 px-4 py-3">
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-violet-100 text-violet-600 shrink-0">
        <Info className="w-4 h-4" />
      </span>
      <div className="text-xs text-violet-900 leading-relaxed">
        <p className="font-semibold mb-1">How meetings work</p>
        <ul className="list-disc list-inside space-y-0.5 text-violet-900/85">
          {MEETINGS_HINTS.map((hint, i) => (
            <li key={i}>{hint}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
