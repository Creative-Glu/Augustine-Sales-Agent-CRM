import { supabase } from '@/lib/supabaseClient';
import { CampaignValues } from '@/types/compaign';

export async function getCompaign(): Promise<any> {
  const { data, error } = await supabase
    .from('campaigns')
    .select(
      `
  *,
  offer:offer_id (
    offer_id,
    offer_name
  )    

`
    )
    .order('createdat', { ascending: false });

  if (error) throw new Error(`Error fetching products: ${error.message}`);
  return data ?? [];
}

export async function createCompaign(compaign: CampaignValues): Promise<CampaignValues> {
  const { data, error } = await supabase.from('campaigns').insert([compaign]).select().single();

  if (error) throw new Error(`Error creating product: ${error.message}`);
  return data;
}

export async function deleteCompaign(id: string | number) {
  const { error } = await supabase.from('campaigns').delete().eq('campaign_id', id);
  if (error) throw new Error(`Error deleting product: ${error.message}`);
}

export async function updateCampaignStatus(campaignId: string | number, newStatus: string) {
  const { data, error } = await supabase
    .from('campaigns')
    .update({ campaign_status: newStatus })
    .eq('campaign_id', campaignId)
    .select()
    .single();

  if (error) throw new Error(`Error updating campaign status: ${error.message}`);
  return data;
}

export async function updateCampaign(
  id: string | number,
  updates: Partial<CampaignValues>
): Promise<CampaignValues> {
  const { data, error } = await supabase
    .from('campaigns')
    .update(updates)
    .eq('campaign_id', id)
    .select()
    .single();

  if (error) throw new Error(`Error updating campaign: ${error.message}`);
  return data;
}
