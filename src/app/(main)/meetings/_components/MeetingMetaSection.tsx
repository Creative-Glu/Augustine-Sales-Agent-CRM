import { ExternalLink, Tag, Users, Video } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Meeting } from '@/types/meeting';
import { DetailRow } from './DetailRow';

interface MeetingMetaSectionProps {
  meeting: Meeting;
}

export function MeetingMetaSection({ meeting }: MeetingMetaSectionProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-card shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-emerald-50 to-blue-50/30 border-b border-slate-200">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-100 text-emerald-600">
          <Users className="w-3.5 h-3.5" />
        </span>
        <p className="text-xs font-bold text-slate-900">Meeting</p>
      </div>
      <div className="p-4 space-y-2 text-sm">
        <DetailRow icon={<Users className="w-3.5 h-3.5" />} label="Hosts">
          {meeting.host_count} host{meeting.host_count === 1 ? '' : 's'} ·{' '}
          {meeting.non_host_count} non-host{meeting.non_host_count === 1 ? '' : 's'}
        </DetailRow>
        <DetailRow icon={<Tag className="w-3.5 h-3.5" />} label="Source">
          <Badge variant="secondary" className="text-[11px] capitalize">
            {meeting.source}
          </Badge>
        </DetailRow>
        <DetailRow icon={<Tag className="w-3.5 h-3.5" />} label="External ID" mono>
          {meeting.external_id}
        </DetailRow>
        {meeting.meeting_url && (
          <DetailRow icon={<Video className="w-3.5 h-3.5" />} label="Join link">
            <a
              href={meeting.meeting_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 underline-offset-2 hover:underline"
            >
              Open
              <ExternalLink className="w-3 h-3" />
            </a>
          </DetailRow>
        )}
      </div>
    </section>
  );
}
