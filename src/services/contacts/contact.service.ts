import { supabase } from '@/lib/supabaseClient';
import { Contact } from '@/types/contact';

export interface ContactsResponse {
  contacts: Contact[];
  total: number;
  hasMore: boolean;
}

export async function getContacts(): Promise<Contact[]> {
  const { data, error } = await supabase
    .from('Augustine 10')
    .select('*')
    .order('id', { ascending: false });

  if (error) throw new Error(`Error fetching contacts: ${error.message}`);
  return data ?? [];
}

export async function getContactsPaginated(
  offset: number = 0,
  limit: number = 10
): Promise<ContactsResponse> {
  // Get total count
  const { count, error: countError } = await supabase
    .from('Augustine 10')
    .select('*', { count: 'exact', head: true });

  if (countError) throw new Error(`Error fetching contacts count: ${countError.message}`);

  // Get paginated contacts
  const { data, error } = await supabase
    .from('Augustine 10')
    .select('*')
    .order('id', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`Error fetching contacts: ${error.message}`);

  const total = count ?? 0;
  const hasMore = offset + limit < total;

  return {
    contacts: data ?? [],
    total,
    hasMore,
  };
}

export async function getContactById(id: number): Promise<Contact | null> {
  const { data, error } = await supabase.from('Augustine 10').select('*').eq('id', id).single();

  if (error) throw new Error(`Error fetching contact: ${error.message}`);
  return data;
}

export async function createContact(contact: Partial<Contact>): Promise<Contact> {
  const { data, error } = await supabase.from('Augustine 10').insert([contact]).select().single();

  if (error) throw new Error(`Error creating contact: ${error.message}`);
  return data;
}

export async function updateContact(id: number, updates: Partial<Contact>): Promise<Contact> {
  const { data, error } = await supabase
    .from('Augustine 10')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Error updating contact: ${error.message}`);
  return data;
}

export async function deleteContact(id: number) {
  const { error } = await supabase.from('Augustine 10').delete().eq('id', id);
  if (error) throw new Error(`Error deleting contact: ${error.message}`);
}

export async function getContactICPs(contactId: number): Promise<string[]> {
  const { data, error } = await supabase
    .from('Augustine 10')
    .select('icps')
    .eq('id', contactId)
    .single();

  if (error) throw new Error(`Error fetching contact ICPs: ${error.message}`);
  
  // Handle both array and object formats
  if (!data?.icps) return [];
  if (Array.isArray(data.icps)) return data.icps;
  if (typeof data.icps === 'object' && data.icps.icp_ids) return data.icps.icp_ids;
  return [];
}

export async function updateContactICPs(contactId: number, icpIds: string[]): Promise<void> {
  const { error } = await supabase
    .from('Augustine 10')
    .update({ icps: icpIds })
    .eq('id', contactId);

  if (error) throw new Error(`Error updating contact ICPs: ${error.message}`);
}

