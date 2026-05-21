'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import {
  getContacts,
  getContactsPaginated,
  getContactDetails,
  createContact,
  updateContact,
  deleteContact,
  ContactsResponse,
  ContactDetails,
} from './contact.service';
import { Contact } from '@/types/contact';

// Re-export types so components don't need to import from service files
export type { Contact, ContactsResponse, ContactDetails };

/** Fetches contact + linked journeys + matching ICP. Disabled until contactId is set. */
export function useContactDetails(contactId: number | null) {
  return useQuery<ContactDetails, Error>({
    queryKey: ['contacts', 'details', contactId],
    queryFn: () => getContactDetails(contactId!),
    enabled: !!contactId,
    staleTime: 30 * 1000,
  });
}

export function useContacts() {
  return useQuery<Contact[], Error>({
    queryKey: ['contacts'],
    queryFn: getContacts,
  });
}

export function useContactsPaginated(limit: number = 10) {
  const searchParams = useSearchParams();
  const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;
  const validOffset = isNaN(offset) || offset < 0 ? 0 : offset;

  return useQuery<ContactsResponse, Error>({
    queryKey: ['contacts', 'paginated', validOffset, limit],
    queryFn: () => getContactsPaginated(validOffset, limit),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createContact,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Contact> }) =>
      updateContact(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contactId: number) => deleteContact(contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

