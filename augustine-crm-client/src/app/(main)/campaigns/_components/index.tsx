'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { useGetCompaign } from '@/services/campaign/useCampaign';
import CampaignTable from './CampaignTable';
import { CreateButton } from '@/components/CreateButton';
import CampaignModal from './CampaignModal';
import { Campaign } from '@/types/compaign';

const CampaignPage = () => {
  const { data: campaignData, isLoading, isError, refetch: fetchCampaign } = useGetCompaign();

  const [isCampaignModalOpen, setCampaignModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const handleEdit = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setCampaignModalOpen(true);
  };

  const handleCloseModal = () => {
    setCampaignModalOpen(false);
    setSelectedCampaign(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
        <div className="p-6">
          <PageHeader
            title="Campaigns"
            subtitle={`Showing ${campaignData?.length || 0} of ${
              campaignData?.length || 0
            } campaigns`}
          >
            <CreateButton label="Create Campaign" onClick={() => setCampaignModalOpen(true)} />
          </PageHeader>

          <CampaignTable
            campaigns={campaignData || []}
            isLoading={isLoading}
            isError={isError}
            fetchCampaignList={fetchCampaign}
            onEdit={handleEdit}
          />
        </div>
      </div>

      <CampaignModal
        open={isCampaignModalOpen}
        onClose={handleCloseModal}
        onCreated={fetchCampaign}
        campaign={selectedCampaign}
      />
    </div>
  );
};

export default CampaignPage;
