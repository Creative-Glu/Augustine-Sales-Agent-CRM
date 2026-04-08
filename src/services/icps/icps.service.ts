import { supabase } from '@/lib/supabaseClient';
import { ICP } from '@/types/icps';

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
