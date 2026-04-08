import { supabase } from '@/lib/supabaseClient';
import { CampaignValues } from '@/types/compaign';

export async function getCompaign(): Promise<any> {
  try {
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
  } catch (error) {
    throw error instanceof Error ? error : new Error('getCompaign failed');
  }
}

export async function createCompaign(compaign: CampaignValues): Promise<CampaignValues> {
  try {
    const { data, error } = await supabase.from('campaigns').insert([compaign]).select().single();

    if (error) throw new Error(`Error creating product: ${error.message}`);
    return data;
  } catch (error) {
    throw error instanceof Error ? error : new Error('createCompaign failed');
  }
}

export async function deleteCompaign(id: string | number) {
  try {
    const { error } = await supabase.from('campaigns').delete().eq('campaign_id', id);
    if (error) throw new Error(`Error deleting product: ${error.message}`);
  } catch (error) {
    throw error instanceof Error ? error : new Error('deleteCompaign failed');
  }
}

export async function updateCampaignStatus(campaignId: string | number, newStatus: string) {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .update({ campaign_status: newStatus })
      .eq('campaign_id', campaignId)
      .select()
      .single();

    if (error) throw new Error(`Error updating campaign status: ${error.message}`);
    return data;
  } catch (error) {
    throw error instanceof Error ? error : new Error('updateCampaignStatus failed');
  }
}

export async function updateCampaign(
  id: string | number,
  updates: Partial<CampaignValues>
): Promise<CampaignValues> {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('campaign_id', id)
      .select()
      .single();

    if (error) throw new Error(`Error updating campaign: ${error.message}`);
    return data;
  } catch (error) {
    throw error instanceof Error ? error : new Error('updateCampaign failed');
  }
}
