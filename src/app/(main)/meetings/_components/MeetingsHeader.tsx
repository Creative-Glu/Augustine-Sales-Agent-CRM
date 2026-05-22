import { Calendar, Download, ExternalLink, RefreshCw } from 'lucide-react';
import { CALENDLY_APP_URL } from '@/constants/meetings';

interface MeetingsHeaderProps {
  isFetching: boolean;
  canExport: boolean;
  onRefresh: () => void;
  onExport: () => void;
}

export function MeetingsHeader({
  isFetching,
  canExport,
  onRefresh,
  onExport,
}: MeetingsHeaderProps) {
  return (
    <div className="px-6 py-5 border-b border-slate-100 flex flex-wrap items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br from-violet-500 to-indigo-600 text-white shadow-sm">
            <Calendar className="w-4 h-4" />
          </span>
          <h1 className="text-xl font-bold text-slate-900">Meetings</h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          All Calendly bookings synced from your account
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
        <button
          type="button"
          onClick={onExport}
          disabled={!canExport}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
          title="Export to CSV"
        >
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
        <a
          href={CALENDLY_APP_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm cursor-pointer transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open Calendly
        </a>
      </div>
    </div>
  );
}
