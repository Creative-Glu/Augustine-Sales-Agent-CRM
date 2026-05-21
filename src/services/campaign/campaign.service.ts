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
    // Cascade chain: logs → journeys → campaigns.
    // Long-term fix: add ON DELETE CASCADE to journeys_campaign_id_fkey and
    // logs_journey_id_fkey, then this function collapses back to a single delete.

    // 1. Find all journey_ids for this campaign
    const { data: journeyRows, error: fetchError } = await supabase
      .from('journeys')
      .select('journey_id')
      .eq('campaign_id', id);

    if (fetchError) {
      throw new Error(`Error fetching campaign journeys: ${fetchError.message}`);
    }

    const journeyIds = (journeyRows ?? []).map((j) => j.journey_id as string);

    // 2. Delete dependent logs (if any journeys exist)
    if (journeyIds.length > 0) {
      const { error: logsError } = await supabase
        .from('logs')
        .delete()
        .in('journey_id', journeyIds);

      if (logsError) {
        throw new Error(`Error deleting campaign logs: ${logsError.message}`);
      }

      // 3. Delete journeys referencing this campaign
      const { error: journeysError } = await supabase
        .from('journeys')
        .delete()
        .eq('campaign_id', id);

      if (journeysError) {
        throw new Error(`Error deleting campaign journeys: ${journeysError.message}`);
      }
    }

    // 4. Finally, delete the campaign itself
    const { error } = await supabase.from('campaigns').delete().eq('campaign_id', id);
    if (error) throw new Error(`Error deleting campaign: ${error.message}`);
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
