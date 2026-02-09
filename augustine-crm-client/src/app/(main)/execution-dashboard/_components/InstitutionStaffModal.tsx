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

interface InstitutionStaffModalProps {
  institution: Institution | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function InstitutionStaffModal({
  institution,
  open,
  onOpenChange,
}: InstitutionStaffModalProps) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !institution) {
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
  }, [open, institution, institution?.id]);

  const title = institution ? institution.name : 'Staff';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl w-[95vw] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Staff – {title}</DialogTitle>
        </DialogHeader>
        <div className="overflow-auto flex-1 min-h-0">
          {loading ? (
            <p className="text-sm text-muted-foreground py-4">Loading staff…</p>
          ) : error ? (
            <p className="text-sm text-red-600 py-4">{error}</p>
          ) : staff.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4 space-y-1">
              <p>No staff linked to this institution.</p>
              <p className="text-xs mt-2">
                Queried <code className="bg-muted px-1 rounded">staff.institution_id = {String(institution?.id)}</code>. In the DB, ensure some rows in <code className="bg-muted px-1 rounded">staff</code> have this <code className="bg-muted px-1 rounded">institution_id</code>.
              </p>
            </div>
          ) : (
            <table className="w-full">
              <TableHeader columns={STAFF_COLUMNS} />
              <tbody>
                {staff.map((row) => (
                  <tr
                    key={row.staff_id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-card-foreground">{cell(row.name)}</td>
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
