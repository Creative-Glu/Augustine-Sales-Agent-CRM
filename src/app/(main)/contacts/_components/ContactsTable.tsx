'use client';

import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { Contact, useDeleteContact } from '@/services/contacts/useContacts';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToastHelpers } from '@/lib/toast';
import { DeleteButton, EditButton, ViewButton } from '@/components/ActionButtons';
import { TableHeader } from '@/components/TableHeader';
import { CONTACTS_TABLE_COLUMNS } from '@/constants';
import { useGetICPs } from '@/services/icps/useICPs';
import { formatDateTimeShort } from '@/utils/format';
import {
  AlertCircle,
  Mail,
  Phone,
  Building2,
  MapPin,
  UserCircle2,
} from 'lucide-react';

interface ContactsTableProps {
  contacts: Contact[];
  isLoading: boolean;
  isError: boolean;
  fetchContactsList: () => void;
  onEdit?: (contact: Contact) => void;
  onView?: (contact: Contact) => void;
}

export default function ContactsTable({
  contacts,
  isLoading,
  isError,
  fetchContactsList,
  onEdit,
  onView,
}: ContactsTableProps) {
  const { successToast, errorToast } = useToastHelpers();
  const { data: icpsData } = useGetICPs();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);

  const { mutateAsync: deleteContact, isPending: isDeleting } = useDeleteContact();

  const getICPName = (contact: Contact): string | null => {
    if (!contact.icp_id || !icpsData) return null;
    return icpsData.find((icp) => icp.icp_id === contact.icp_id)?.icp_name ?? null;
  };

  const openDeleteDialog = (contactId: number) => {
    setSelectedContactId(contactId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedContactId) return;
    try {
      setIsDeleteDialogOpen(false);
      await deleteContact(selectedContactId);
      successToast('Contact deleted successfully!');
    } catch (err) {
      const detail = err instanceof Error ? err.message : '';
      errorToast(`Failed to delete contact${detail ? ` — ${detail}` : ''}`);
    }
    fetchContactsList();
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <TableHeader columns={CONTACTS_TABLE_COLUMNS} />

          <tbody>
            {/* Loading */}
            {isLoading && (
              <>
                {Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0">
                    <td colSpan={6} className="py-2 px-3">
                      <Skeleton className="h-10 w-full" />
                    </td>
                  </tr>
                ))}
              </>
            )}

            {/* Error */}
            {!isLoading && isError && (
              <tr>
                <td colSpan={6} className="py-8">
                  <div className="flex flex-col items-center text-center gap-1.5">
                    <AlertCircle className="w-5 h-5 text-rose-500" />
                    <p className="text-sm font-medium text-rose-700">
                      Failed to load contacts
                    </p>
                    <button
                      type="button"
                      onClick={fetchContactsList}
                      className="text-xs font-medium text-rose-600 hover:text-rose-800 underline"
                    >
                      Try again
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {/* Empty */}
            {!isLoading && !isError && contacts.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8">
                  <div className="flex flex-col items-center text-center gap-1.5">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100">
                      <UserCircle2 className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-xs font-medium text-slate-700">No contacts found</p>
                  </div>
                </td>
              </tr>
            )}

            {/* Rows */}
            {!isLoading &&
              !isError &&
              contacts.map((contact) => {
                const icpName = getICPName(contact);
                return (
                  <tr
                    key={contact.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors"
                  >
                    {/* Parish / Lead — name + lead ID */}
                    <td className="py-2 px-3 min-w-0">
                      <p
                        className="text-sm font-medium text-slate-900 truncate max-w-50"
                        title={contact['Parish Name'] ?? `Lead #${contact.id}`}
                      >
                        {contact['Parish Name'] || `Lead #${contact.id}`}
                      </p>
                      <p className="text-[10px] font-mono text-slate-500 truncate">
                        #{contact.id}
                      </p>
                    </td>

                    {/* Contact — email + phone stacked */}
                    <td className="py-2 px-3 min-w-0">
                      {contact['Parish Contact Email'] && (
                        <p
                          className="text-[11px] text-slate-700 flex items-center gap-1 truncate max-w-50"
                          title={contact['Parish Contact Email']}
                        >
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {contact['Parish Contact Email']}
                          </span>
                        </p>
                      )}
                      {contact['Parish Phone'] && (
                        <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5 whitespace-nowrap">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          {contact['Parish Phone']}
                        </p>
                      )}
                      {!contact['Parish Contact Email'] && !contact['Parish Phone'] && (
                        <span className="text-[11px] text-slate-400 italic">
                          No contact info
                        </span>
                      )}
                    </td>

                    {/* Institution / Location */}
                    <td className="py-2 px-3 min-w-0">
                      {contact['Institution Type'] ? (
                        <span className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-800">
                          <Building2 className="w-3 h-3" />
                          {contact['Institution Type']}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          No institution
                        </span>
                      )}
                      {contact['Diocese/Archdiocese Name'] && (
                        <p
                          className="text-[11px] text-slate-500 flex items-center gap-1 truncate max-w-40 mt-0.5"
                          title={contact['Diocese/Archdiocese Name']}
                        >
                          <MapPin className="w-3 h-3 shrink-0" />
                          {contact['Diocese/Archdiocese Name']}
                        </p>
                      )}
                    </td>

                    {/* ICP */}
                    <td className="py-2 px-3">
                      {icpName ? (
                        <span
                          className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 max-w-40 truncate"
                          title={icpName}
                        >
                          {icpName}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No ICP</span>
                      )}
                    </td>

                    {/* Created date + time */}
                    <td className="py-2 px-3 text-[11px] text-slate-500 tabular-nums whitespace-nowrap">
                      {formatDateTimeShort(contact.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="py-2 px-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <ViewButton onClick={() => onView?.(contact)} />
                        <EditButton onClick={() => onEdit?.(contact)} />
                        <DeleteButton onDelete={() => openDeleteDialog(contact.id)} />
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={() => setIsDeleteDialogOpen(false)}
        title="Delete Contact"
        description="Are you sure you want to delete this contact? Their journey history and campaign records may be affected."
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />
    </div>
  );
}
