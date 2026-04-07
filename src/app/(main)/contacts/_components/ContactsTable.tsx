'use client';

import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { Contact, useDeleteContact } from '@/services/contacts/useContacts';
import { useState } from 'react';
import { useToastHelpers } from '@/lib/toast';
import { DeleteButton, EditButton, ViewButton } from '@/components/ActionButtons';
import { TableHeader } from '@/components/TableHeader';
import { CONTACTS_TABLE_COLUMNS } from '@/constants';
import { useGetICPs } from '@/services/icps/useICPs';
import { Badge } from '@/components/ui/badge';

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

  const { mutateAsync: deleteContact } = useDeleteContact();

  // Helper function to get ICP names from contact
  const getICPNames = (contact: Contact): string[] => {
    if (!contact.icps || !icpsData) return [];
    const icpIds = Array.isArray(contact.icps) ? contact.icps : [];
    return icpIds
      .map((id) => icpsData.find((icp) => icp.icp_id === id)?.icp_name)
      .filter((name): name is string => !!name);
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
      successToast('Contact Deleted successfully!');
    } catch (error) {
      errorToast('failed to delete');
    }

    fetchContactsList();
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full">
          <TableHeader columns={CONTACTS_TABLE_COLUMNS} />

          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">
                  <div className="animate-pulse text-sm">Loading contacts...</div>
                </td>
              </tr>
            )}

            {isError && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-red-500">
                  Failed to load contacts. Please try again.
                </td>
              </tr>
            )}

            {!isLoading && !isError && contacts.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">
                  No contacts found.
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              contacts.map((contact) => (
                <tr
                  key={contact.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="font-medium text-card-foreground">
                      {contact['Parish Name'] || 'N/A'}
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="text-sm text-muted-foreground">
                      {contact['Parish Contact Email'] || 'N/A'}
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="text-sm text-muted-foreground">
                      {contact['Parish Phone'] || 'N/A'}
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="text-sm text-muted-foreground">
                      {contact['Institution Type'] || 'N/A'}
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      {getICPNames(contact).length > 0 ? (
                        getICPNames(contact).slice(0, 2).map((name, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                      {getICPNames(contact).length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{getICPNames(contact).length - 2}
                        </Badge>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-4 flex items-center justify-center gap-2">
                    <ViewButton onClick={() => onView?.(contact)} />
                    <EditButton onClick={() => onEdit?.(contact)} />
                    <DeleteButton onDelete={() => openDeleteDialog(contact.id)} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={() => setIsDeleteDialogOpen(false)}
        title="Delete Contact"
        description="Are you sure you want to delete this contact?"
        onConfirm={handleConfirmDelete}
        loading={isLoading}
      />
    </div>
  );
}

