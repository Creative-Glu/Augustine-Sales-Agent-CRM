// ─── Outreach Page Constants ───────────────────────────────────────────────

export type OutreachTabKey = 'pending' | 'approved_unsent' | 'sent' | 'rejected';

export const OUTREACH_TABS: { key: OutreachTabKey; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved_unsent', label: 'Approved' },
  { key: 'sent', label: 'Sent' },
  { key: 'rejected', label: 'Rejected' },
];
