'use client';

import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Pagination from '@/components/Pagination';
import { useContactsPaginated, Contact } from '@/services/contacts/useContacts';
import ContactsTable from './ContactsTable';
import React from 'react';
import { PageHeader } from '@/components/PageHeader';
import { CreateButton } from '@/components/CreateButton';

const ContactModal = dynamic(() => import('./ContactModal'), { ssr: false });
const ContactViewModal = dynamic(() => import('./ContactViewModal'), { ssr: false });

export default function ContactsPage() {
  const searchParams = useSearchParams();
  const limit = 10;
  const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;
  const validOffset = isNaN(offset) || offset < 0 ? 0 : offset;

  const { data, isLoading, isError, refetch: fetchContactsList } = useContactsPaginated(limit);

  const { contacts, total, hasMore } = data || { contacts: [], total: 0, hasMore: false };
  const currentPage = Math.floor(validOffset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  const [isContactModalOpen, setContactModalOpen] = React.useState(false);
  const [isContactViewModalOpen, setContactViewModalOpen] = React.useState(false);
  const [selectedContact, setSelectedContact] = React.useState<Contact | null>(null);

  const handleEdit = (contact: Contact) => {
    setSelectedContact(contact);
    setContactModalOpen(true);
  };

  const handleView = (contact: Contact) => {
    setSelectedContact(contact);
    setContactViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setContactModalOpen(false);
    setSelectedContact(null);
  };

  const handleCloseViewModal = () => {
    setContactViewModalOpen(false);
    setSelectedContact(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
        <div className="p-6">
          <PageHeader
            title="Contacts"
            subtitle={`Showing ${contacts.length} of ${total} contacts`}
          >
            <CreateButton label="Create Contact" onClick={() => setContactModalOpen(true)} />
          </PageHeader>

          <ContactsTable
            contacts={contacts}
            isLoading={isLoading}
            isError={isError}
            fetchContactsList={fetchContactsList}
            onEdit={handleEdit}
            onView={handleView}
          />
        </div>
      </div>

      {total > limit && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          currentOffset={validOffset}
          limit={limit}
          hasMore={hasMore}
          basePath="/contacts"
          queryParamName="offset"
        />
      )}

      <ContactModal
        open={isContactModalOpen}
        onClose={handleCloseModal}
        onCreated={fetchContactsList}
        contact={selectedContact}
      />

      <ContactViewModal
        open={isContactViewModalOpen}
        onClose={handleCloseViewModal}
        contact={selectedContact}
      />
    </div>
  );
}

