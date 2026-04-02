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
import { Button } from '@/components/ui/button';
import { useToastHelpers } from '@/lib/toast';
import { runHubspotSingleSync } from '@/services/augustine/hubspotSync.service';
import { useAuth } from '@/providers/AuthProvider';
import { formatDateTime } from '@/utils/format';

const HUBSPOT_BASE = 'https://app.hubspot.com/contacts';

/** Build a HubSpot contact/company URL from portal ID and entity ID. */
function hubspotUrl(portalId: string, entityType: 'contact' | 'company', entityId: string): string {
  return `${HUBSPOT_BASE}/${portalId}/${entityType}/${entityId}`;
}

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
      ? hubspotUrl(portalId, entityType === 'staff' ? 'contact' : 'company', hubspotId)
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
  const { user } = useAuth();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { successToast, errorToast } = useToastHelpers();

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
                  <DetailRow label="Contact number" value={institution.contact} />
                  <DetailRow label="Website" value={institution.website_url} />
                  <DetailRow label="Address" value={institution.address} />
                  <DetailRow label="Type" value={institution.type} />
                  <DetailRow label="Created" value={formatDateTime(institution.created_at)} />
                </dl>
                <div className="mt-4 pt-4 border-t border-border/60">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">HubSpot Sync Status</h4>
                  <dl className="text-sm space-y-1">
                    <DetailRow label="Sync Status" value={institution.sync_status ?? '—'} />
                    <DetailRow label="HubSpot ID" value={institution.hubspot_company_id ?? '—'} />
                    <DetailRow label="Last Sync Time" value={institution.last_synced_at ? formatDateTime(institution.last_synced_at) : '—'} />
                    <DetailRow label="Sync Error" value={institution.sync_error ?? '—'} />
                    <DetailRow label="Current Queue Status" value={institution.sync_status ? String(institution.sync_status) : 'Not in sync queue'} />
                  </dl>
                  {user?.role === 'Admin' && (
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          if (!institution?.id) return;
                          try {
                            const res = await runHubspotSingleSync(
                              'institution',
                              Number(institution.id)
                            );
                            if (!res.enabled) {
                              errorToast('HubSpot sync is currently turned off.');
                              return;
                            }
                            successToast('Institution sync to HubSpot queued.');
                          } catch (e) {
                            errorToast(
                              e instanceof Error
                                ? e.message
                                : 'Failed to trigger HubSpot sync.'
                            );
                          }
                        }}
                      >
                        Sync to HubSpot now
                      </Button>
                    </div>
                  )}
                </div>
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
                              {row.synced_to_hubspot === true &&
                                row.hubspot_contact_id &&
                                process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID && (
                                  <a
                                    href={hubspotUrl(process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID!, 'contact', row.hubspot_contact_id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline"
                                  >
                                    Open in HubSpot
                                  </a>
                                )}
                              {user?.role === 'Admin' && (
                                <div className="mt-1">
                                  <Button
                                    type="button"
                                    size="xs"
                                    variant="outline"
                                    onClick={async () => {
                                      try {
                                        const res = await runHubspotSingleSync(
                                          'staff',
                                          row.staff_id
                                        );
                                        if (!res.enabled) {
                                          errorToast(
                                            'HubSpot sync is currently turned off.'
                                          );
                                          return;
                                        }
                                        successToast(
                                          'Staff sync to HubSpot queued.'
                                        );
                                      } catch (e) {
                                        errorToast(
                                          e instanceof Error
                                            ? e.message
                                            : 'Failed to trigger HubSpot sync.'
                                        );
                                      }
                                    }}
                                  >
                                    Sync to HubSpot now
                                  </Button>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {cell(row.role)}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {row.email ? (
                              <a
                                href={`mailto:${row.email}`}
                                className="text-blue-600 hover:underline"
                              >
                                {row.email}
                              </a>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {cell(row.contact_number)}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {formatDateTime(row.created_at)}
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
