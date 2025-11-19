import { CAMPAIGN_STATUS_OPTIONS } from '@/constants';
import { CustomeSelect } from '@/components/CustomeSelect';
import { useUpdateCampaignStatus } from '@/services/campaign/useCampaign';
import { useToastHelpers } from '@/lib/toast';
import { statusColors } from './StatusBadge';

interface CampaignStatusDropdownProps {
  campaignId: number;
  currentStatus: string;
}

export const CampaignStatusDropdown = ({
  campaignId,
  currentStatus,
}: CampaignStatusDropdownProps) => {
  const { mutate: updateCampaignStatus, isPending } = useUpdateCampaignStatus();
  const { successToast, errorToast } = useToastHelpers();

  const handleChange = async (val: string) => {
    try {
      updateCampaignStatus({ campaignId, newStatus: val });
      successToast('Campaign status updated successfully');
    } catch (err) {
      errorToast('Failed to update status');
      console.error('Failed to update status', err);
    }
  };

  return (
    <CustomeSelect
      label=""
      value={currentStatus}
      onChange={handleChange}
      optionsData={CAMPAIGN_STATUS_OPTIONS}
      placeholder="Select Status"
      loading={isPending}
      className={`p-0 px-2 ${statusColors[currentStatus] || statusColors['Default']}`}
    />
  );
};
