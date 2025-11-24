import { supabase } from '@/lib/supabaseClient';
import { ICP } from '@/types/icps';

export const getICPs = async () => {
  const { data, error } = await supabase
    .from('icps')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

interface CreateICPInput {
  icp_id: string;
  icp_name: string;
  icp_desc: string;
}

export const createICP = async (payload: CreateICPInput): Promise<ICP> => {
  const { data, error } = await supabase.from('icps').insert(payload).select().single();

  if (error) throw new Error(error.message);

  return data;
};

export async function deleteICPs(icpId: string | number) {
  const { error } = await supabase.from('icps').delete().eq('icp_id', icpId);
  if (error) throw new Error(`Error deleting product: ${error.message}`);
}

export async function updateICP(id: string, updates: Partial<ICP>): Promise<ICP> {
  const { data, error } = await supabase
    .from('icps')
    .update(updates)
    .eq('icp_id', id)
    .select()
    .single();

  if (error) throw new Error(`Error updating ICP: ${error.message}`);
  return data;
}
