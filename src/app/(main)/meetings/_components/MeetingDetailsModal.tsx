'use client';

import { Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Meeting } from '@/types/meeting';
import { MeetingStatusBanner } from './MeetingStatusBanner';
import { MeetingSummaryCard } from './MeetingSummaryCard';
import { MeetingInviteeSection } from './MeetingInviteeSection';
import { MeetingMetaSection } from './MeetingMetaSection';
import { MeetingNotesSection } from './MeetingNotesSection';

interface MeetingDetailsModalProps {
  open: boolean;
  onClose: () => void;
  meeting: Meeting | null;
}

export default function MeetingDetailsModal({
  open,
  onClose,
  meeting,
}: MeetingDetailsModalProps) {
  if (!meeting) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-170 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-linear-to-br from-violet-500 to-indigo-600 text-white shadow-sm">
              <Calendar className="w-4 h-4" />
            </span>
            Meeting Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <MeetingStatusBanner status={meeting.status} />
          <MeetingSummaryCard meeting={meeting} />
          <MeetingInviteeSection meeting={meeting} />
          <MeetingMetaSection meeting={meeting} />
          {meeting.notes && <MeetingNotesSection notes={meeting.notes} />}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
