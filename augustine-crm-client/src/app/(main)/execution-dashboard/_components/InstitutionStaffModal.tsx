'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TableHeader } from '@/components/TableHeader';
import type { Institution } from '@/types/execution';
import type { Staff } from '@/types/execution';
import { getStaffByInstitutionId } from '@/services/execution/staff.service';

function ManagedInHubSpotBanner({
  entityType,
  hubspotId,
  portalId,
}: {
  entityType: 'institution' | 'staff';
  hubspotId?: string | null;
  portalId?: string;
}) {
  const href =
    portalId && hubspotId
      ? entityType === 'staff'
        ? `https://app.hubspot.com/contacts/${portalId}/contact/${hubspotId}`
        : `https://app.hubspot.com/contacts/${portalId}/company/${hubspotId}`
      : null;

  return (
    <div className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2 flex items-center justify-between gap-2 mb-4">
      <span className="text-sm font-medium text-muted-foreground">Managed in HubSpot</span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline"
        >
          Open in HubSpot
        </a>
      ) : (
        <span className="text-xs text-muted-foreground">Configure NEXT_PUBLIC_HUBSPOT_PORTAL_ID for link</span>
      )}
    </div>
  );
}

const STAFF_COLUMNS = [
  { label: 'Name', align: 'left' as const },
  { label: 'Role', align: 'left' as const },
  { label: 'Email', align: 'left' as const },
  { label: 'Contact number', align: 'left' as const },
  { label: 'Created', align: 'left' as const },
];

function cell(value: string | null | undefined): string {
  return value ?? '—';
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  const v = value?.trim();
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 py-2 border-b border-border/50 last:border-0">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">
        {v ? (
          label.toLowerCase().includes('email') ? (
            <a href={`mailto:${v}`} className="text-primary hover:underline">
              {v}
            </a>
          ) : label.toLowerCase().includes('website') && (v.startsWith('http') || v.includes('.')) ? (
            <a
              href={v.startsWith('http') ? v : `https://${v}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {v}
            </a>
          ) : (
            v
          )
        ) : (
          '—'
        )}
      </dd>
    </div>
  );
}

interface InstitutionStaffModalProps {
  institution: Institution | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When 'details', show institution details (e.g. from Staff page). When 'staff', show staff list (e.g. from Institution page). */
  mode?: 'details' | 'staff';
}

export default function InstitutionStaffModal({
  institution,
  open,
  onOpenChange,
  mode = 'staff',
}: InstitutionStaffModalProps) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== 'staff' || !open || !institution) {
      setStaff([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    getStaffByInstitutionId(institution.id)
      .then(setStaff)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load staff'))
      .finally(() => setLoading(false));
  }, [mode, open, institution, institution?.id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl w-[95vw] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {mode === 'details' ? 'Institution details' : `Staff – ${institution?.name ?? 'Institution'}`}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-auto flex-1 min-h-0">
          {mode === 'details' ? (
            !institution ? (
              <p className="text-sm text-muted-foreground py-4">No institution selected.</p>
            ) : (
              <>
                {institution.synced_to_hubspot === true && (
                  <ManagedInHubSpotBanner
                    entityType="institution"
                    hubspotId={institution.hubspot_company_id}
                    portalId={process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID}
                  />
                )}
                <dl className="text-sm">
                  <DetailRow label="Name" value={institution.name} />
                  <DetailRow label="Email" value={institution.email} />
                  <DetailRow label="Contact" value={institution.contact} />
                  <DetailRow label="Website" value={institution.website_url} />
                  <DetailRow label="Address" value={institution.address} />
                  <DetailRow label="Type" value={institution.type} />
                  <DetailRow label="Created" value={formatDate(institution.created_at)} />
                </dl>
              </>
            )
          ) : (
            <>
              {loading ? (
                <p className="text-sm text-muted-foreground py-4">Loading staff…</p>
              ) : error ? (
                <p className="text-sm text-red-600 py-4">{error}</p>
              ) : staff.length === 0 ? (
                <div className="text-sm text-muted-foreground py-4 space-y-1">
                  <p>No staff linked to this institution.</p>
                  <p className="text-xs mt-2">
                    Queried <code className="bg-muted px-1 rounded">staff.institution_id = {String(institution?.id)}</code>.
                  </p>
                </div>
              ) : (
                <>
                  {staff.some((s) => s.synced_to_hubspot === true) && (
                    <ManagedInHubSpotBanner
                      entityType="staff"
                      portalId={process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID}
                    />
                  )}
                  <table className="w-full">
                    <TableHeader columns={STAFF_COLUMNS} />
                    <tbody>
                      {staff.map((row) => (
                        <tr
                          key={row.staff_id}
                          className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-3 px-4 font-medium text-foreground">
                            <div className="flex flex-col gap-0.5">
                              {cell(row.name)}
                              {row.synced_to_hubspot === true && row.hubspot_contact_id && process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID && (
                                <a
                                  href={`https://app.hubspot.com/contacts/${process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID}/contact/${row.hubspot_contact_id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline"
                                >
                                  Open in HubSpot
                                </a>
                              )}
                            </div>
                          </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{cell(row.role)}</td>
                        <td className="py-3 px-4 text-sm">
                          {row.email ? (
                            <a href={`mailto:${row.email}`} className="text-blue-600 hover:underline">
                              {row.email}
                            </a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{cell(row.contact_number)}</td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {formatDate(row.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
