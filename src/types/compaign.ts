export interface CampaignValues {
  campaign_id: number;
  campaign_name: string;
  offer_id: string;
  instructions: string;
  campaign_status: 'Running' | 'Draft';
}

export interface Campaign {
  campaign_id: number;
  campaign_name: string;
  offer_id: string;
  createdat: string;
  instructions: string;
  campaign_status: string;
  offer?: {
    offer_id: string;
    offer_name: string;
  };
}
