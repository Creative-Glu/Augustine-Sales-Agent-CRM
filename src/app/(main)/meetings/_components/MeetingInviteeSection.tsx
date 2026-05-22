import { Mail, User } from 'lucide-react';
import type { Meeting } from '@/types/meeting';
import { DetailRow } from './DetailRow';

interface MeetingInviteeSectionProps {
  meeting: Meeting;
}

export function MeetingInviteeSection({ meeting }: MeetingInviteeSectionProps) {
  const hasAny = !!meeting.invitee_name || !!meeting.invitee_email;

  return (
    <section className="rounded-xl border border-slate-200 bg-card shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-slate-50 to-blue-50/30 border-b border-slate-200">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-blue-100 text-blue-600">
          <User className="w-3.5 h-3.5" />
        </span>
        <p className="text-xs font-bold text-slate-900">Invitee</p>
      </div>
      <div className="p-4 space-y-2 text-sm">
        {meeting.invitee_name && (
          <DetailRow icon={<User className="w-3.5 h-3.5" />} label="Name">
            {meeting.invitee_name}
          </DetailRow>
        )}
        {meeting.invitee_email && (
          <DetailRow icon={<Mail className="w-3.5 h-3.5" />} label="Email">
            <a
              href={`mailto:${meeting.invitee_email}`}
              className="text-blue-600 hover:text-blue-800 underline-offset-2 hover:underline truncate inline-block max-w-80"
            >
              {meeting.invitee_email}
            </a>
          </DetailRow>
        )}
        {!hasAny && (
          <p className="text-[12px] text-slate-400 italic">No invitee information.</p>
        )}
      </div>
    </section>
  );
}
