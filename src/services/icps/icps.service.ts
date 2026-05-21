import { supabase } from '@/lib/supabaseClient';
import { ICP } from '@/types/icps';

export interface ICPsResponse {
  icps: ICP[];
  total: number;
  hasMore: boolean;
}

export interface LinkedOfferSummary {
  offer_id: string;
  offer_name: string;
  created_at?: string | null;
  offer_1?: string | null;
  offer_2?: string | null;
  offer_3?: string | null;
  offer_1_product?: { product_id: string; product_name: string } | null;
  offer_2_product?: { product_id: string; product_name: string } | null;
  offer_3_product?: { product_id: string; product_name: string } | null;
}

export interface LinkedContactSummary {
  id: number;
  'Parish Name'?: string | null;
  'Parish Contact Email'?: string | null;
  'Parish Phone'?: string | null;
  'Institution Type'?: string | null;
  'Diocese/Archdiocese Name'?: string | null;
  Classification?: string | null;
}

export interface ICPDetails {
  icp: ICP;
  offers: LinkedOfferSummary[];
  contacts: LinkedContactSummary[];
  contactsTotal: number;
}

const CONTACTS_PREVIEW_LIMIT = 10;

export const getICPs = async () => {
  try {
    const { data, error } = await supabase
      .from('icps')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Error fetching ICPs: ${error.message}`);
    return data;
  } catch (error) {
    throw error instanceof Error ? error : new Error('getICPs failed');
  }
};

export async function getICPsPaginated(
  offset: number = 0,
  limit: number = 10
): Promise<ICPsResponse> {
  try {
    const [dataResult, countResult] = await Promise.all([
      supabase
        .from('icps')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1),
      supabase.from('icps').select('icp_id', { count: 'exact', head: true }),
    ]);

    if (dataResult.error) {
      throw new Error(`Error fetching ICPs: ${dataResult.error.message}`);
    }

    const icps = (dataResult.data ?? []) as ICP[];
    const fallbackTotal =
      offset + icps.length + (icps.length === limit ? 1 : 0);
    const total = countResult.error
      ? fallbackTotal
      : (countResult.count ?? fallbackTotal);

    return {
      icps,
      total,
      hasMore: offset + icps.length < total,
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error('getICPsPaginated failed');
  }
}

/**
 * Fetch everything related to a single ICP: the ICP itself, every product
 * offer that targets it (with bundled products), and a preview of the
 * contacts/leads matching it plus the total count.
 */
export async function getICPDetails(icpId: string): Promise<ICPDetails> {
  try {
    const [icpResult, offersResult, contactsResult, contactsCountResult] =
      await Promise.all([
        supabase.from('icps').select('*').eq('icp_id', icpId).single(),
        supabase
          .from('product_offers')
          .select(
            `
            offer_id,
            offer_name,
            created_at,
            offer_1,
            offer_2,
            offer_3,
            offer_1_product:offer_1 (product_id, product_name),
            offer_2_product:offer_2 (product_id, product_name),
            offer_3_product:offer_3 (product_id, product_name)
          `
          )
          .eq('icp_id', icpId),
        supabase
          .from('Augustine 10')
          .select(
            'id, "Parish Name", "Parish Contact Email", "Parish Phone", "Institution Type", "Diocese/Archdiocese Name", Classification'
          )
          .eq('icp_id', icpId)
          .limit(CONTACTS_PREVIEW_LIMIT),
        supabase
          .from('Augustine 10')
          .select('id', { count: 'exact', head: true })
          .eq('icp_id', icpId),
      ]);

    if (icpResult.error) {
      throw new Error(`Error fetching ICP: ${icpResult.error.message}`);
    }
    if (offersResult.error) {
      throw new Error(
        `Error fetching linked offers: ${offersResult.error.message}`
      );
    }
    // Contacts errors are non-fatal — render the section with a notice.
    const contacts = contactsResult.error
      ? []
      : ((contactsResult.data ?? []) as unknown as LinkedContactSummary[]);
    const contactsTotal = contactsCountResult.error
      ? contacts.length
      : (contactsCountResult.count ?? contacts.length);

    return {
      icp: icpResult.data as ICP,
      offers: (offersResult.data ?? []) as unknown as LinkedOfferSummary[],
      contacts,
      contactsTotal,
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error('getICPDetails failed');
  }
}

interface CreateICPInput {
  icp_id: string;
  icp_name: string;
  icp_desc: string;
}

export const createICP = async (payload: CreateICPInput): Promise<ICP> => {
  try {
    const { data, error } = await supabase.from('icps').insert(payload).select().single();

    if (error) throw new Error(error.message);

    return data;
  } catch (error) {
    throw error instanceof Error ? error : new Error('createICP failed');
  }
};

export async function deleteICPs(icpId: string | number) {
  try {
    const { error } = await supabase.from('icps').delete().eq('icp_id', icpId);
    if (error) throw new Error(`Error deleting product: ${error.message}`);
  } catch (error) {
    throw error instanceof Error ? error : new Error('deleteICPs failed');
  }
}

export async function updateICP(id: string, updates: Partial<ICP>): Promise<ICP> {
  try {
    const { data, error } = await supabase
      .from('icps')
      .update(updates)
      .eq('icp_id', id)
      .select()
      .single();

    if (error) throw new Error(`Error updating ICP: ${error.message}`);
    return data;
  } catch (error) {
    throw error instanceof Error ? error : new Error('updateICP failed');
  }
}
