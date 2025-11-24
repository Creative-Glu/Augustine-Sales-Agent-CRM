'use client';

import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { Contact, useDeleteContact } from '@/services/contacts/useContacts';
import { useState } from 'react';
import { useToastHelpers } from '@/lib/toast';
import { DeleteButton, EditButton, ViewButton } from '@/components/ActionButtons';
import { TableHeader } from '@/components/TableHeader';
import { CONTACTS_TABLE_COLUMNS } from '@/constants';

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

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);

  const { mutateAsync: deleteContact } = useDeleteContact();

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
                <td colSpan={5} className="py-8 text-center text-muted-foreground">
                  <div className="animate-pulse text-sm">Loading contacts...</div>
                </td>
              </tr>
            )}

            {isError && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-red-500">
                  Failed to load contacts. Please try again.
                </td>
              </tr>
            )}

            {!isLoading && !isError && contacts.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-foreground">
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

