import { supabase } from '@/lib/supabaseClient';
import { Contact } from '@/types/contact';

export interface ContactsResponse {
  contacts: Contact[];
  total: number;
  hasMore: boolean;
}

export interface LinkedJourneySummary {
  journey_id: string;
  campaign_id: number;
  funnel_stage: string;
  last_interaction: string;
  created_at: string;
  notes?: string | null;
  campaigns?: {
    campaign_id: number;
    campaign_name: string;
    campaign_status: string;
  } | null;
}

export interface LinkedIcpInfo {
  icp_id: string;
  icp_name: string;
  icp_desc?: string | null;
  created_at?: string | null;
}

export interface ContactDetails {
  contact: Contact;
  icp: LinkedIcpInfo | null;
  journeys: LinkedJourneySummary[];
}

export async function getContactDetails(contactId: number): Promise<ContactDetails> {
  try {
    const [contactResult, journeysResult] = await Promise.all([
      supabase.from('Augustine 10').select('*').eq('id', contactId).single(),
      supabase
        .from('journeys')
        .select(
          `
          journey_id,
          campaign_id,
          funnel_stage,
          last_interaction,
          created_at,
          notes,
          campaigns:campaign_id (
            campaign_id,
            campaign_name,
            campaign_status
          )
        `
        )
        .eq('lead_id', contactId)
        .order('last_interaction', { ascending: false }),
    ]);

    if (contactResult.error) {
      throw new Error(`Error fetching contact: ${contactResult.error.message}`);
    }

    const contact = contactResult.data as Contact;
    let icp: LinkedIcpInfo | null = null;
    if (contact?.icp_id) {
      const { data: icpData, error: icpError } = await supabase
        .from('icps')
        .select('icp_id, icp_name, icp_desc, created_at')
        .eq('icp_id', contact.icp_id)
        .single();
      if (!icpError && icpData) {
        icp = icpData as LinkedIcpInfo;
      }
    }

    // Journey errors are non-fatal — show empty section if it fails.
    const journeys = journeysResult.error
      ? []
      : ((journeysResult.data ?? []) as unknown as LinkedJourneySummary[]);

    return { contact, icp, journeys };
  } catch (error) {
    throw error instanceof Error ? error : new Error('getContactDetails failed');
  }
}

export async function getContacts(): Promise<Contact[]> {
  try {
    const { data, error } = await supabase
      .from('Augustine 10')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw new Error(`Error fetching contacts: ${error.message}`);
    return data ?? [];
  } catch (error) {
    throw error instanceof Error ? error : new Error('getContacts failed');
  }
}

export async function getContactsPaginated(
  offset: number = 0,
  limit: number = 10
): Promise<ContactsResponse> {
  try {
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
  } catch (error) {
    throw error instanceof Error ? error : new Error('getContactsPaginated failed');
  }
}

export async function getContactById(id: number): Promise<Contact | null> {
  try {
    const { data, error } = await supabase.from('Augustine 10').select('*').eq('id', id).single();

    if (error) throw new Error(`Error fetching contact: ${error.message}`);
    return data;
  } catch (error) {
    throw error instanceof Error ? error : new Error('getContactById failed');
  }
}

export async function createContact(contact: Partial<Contact>): Promise<Contact> {
  try {
    const { data, error } = await supabase.from('Augustine 10').insert([contact]).select().single();

    if (error) throw new Error(`Error creating contact: ${error.message}`);
    return data;
  } catch (error) {
    throw error instanceof Error ? error : new Error('createContact failed');
  }
}

export async function updateContact(id: number, updates: Partial<Contact>): Promise<Contact> {
  try {
    const { data, error } = await supabase
      .from('Augustine 10')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Error updating contact: ${error.message}`);
    return data;
  } catch (error) {
    throw error instanceof Error ? error : new Error('updateContact failed');
  }
}

export async function deleteContact(id: number) {
  try {
    const { error } = await supabase.from('Augustine 10').delete().eq('id', id);
    if (error) throw new Error(`Error deleting contact: ${error.message}`);
  } catch (error) {
    throw error instanceof Error ? error : new Error('deleteContact failed');
  }
}

export async function getContactICPs(contactId: number): Promise<string[]> {
  try {
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
  } catch (error) {
    throw error instanceof Error ? error : new Error('getContactICPs failed');
  }
}

export async function updateContactICPs(contactId: number, icpIds: string[]): Promise<void> {
  try {
    const { error } = await supabase
      .from('Augustine 10')
      .update({ icps: icpIds })
      .eq('id', contactId);

    if (error) throw new Error(`Error updating contact ICPs: ${error.message}`);
  } catch (error) {
    throw error instanceof Error ? error : new Error('updateContactICPs failed');
  }
}

