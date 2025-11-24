'use client';

import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { useState } from 'react';
import { useToastHelpers } from '@/lib/toast';
import { DeleteButton, EditButton } from '@/components/ActionButtons';
import { TableHeader } from '@/components/TableHeader';
import { CAMPAIGN_COLUMNS, CAMPAIGN_STATUS_OPTIONS } from '@/constants';
import { formatDate } from '@/utils/format';
import { StatusBadge } from './StatusBadge';
import { Campaign } from '@/types/compaign';
import { useDeleteCompaign } from '@/services/campaign/useCampaign';
import { CampaignStatusDropdown } from './CampaignStatusDropdown';

interface CampaignTableProps {
  campaigns: Campaign[];
  isLoading: boolean;
  isError: boolean;
  fetchCampaignList: () => void;
  onEdit?: (campaign: Campaign) => void;
}

export default function CampaignTable({
  campaigns,
  isLoading,
  isError,
  fetchCampaignList,
  onEdit,
}: CampaignTableProps) {
  const { successToast, errorToast } = useToastHelpers();
  const { mutateAsync: deleteCompaign } = useDeleteCompaign();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);

  const openDeleteDialog = (campaignId: number) => {
    setSelectedCampaignId(campaignId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCampaignId) return;
    try {
      setIsDeleteDialogOpen(false);

      await deleteCompaign(selectedCampaignId);
      successToast('Campaign deleted successfully!');
    } catch (error) {
      errorToast('Failed to delete campaign');
    }

    fetchCampaignList();
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full">
          <TableHeader columns={CAMPAIGN_COLUMNS} />

          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">
                  <div className="animate-pulse text-sm">Loading campaigns...</div>
                </td>
              </tr>
            )}

            {isError && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-red-500">
                  Failed to load campaigns. Please try again.
                </td>
              </tr>
            )}

            {!isLoading && !isError && campaigns.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">
                  No campaigns found.
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              campaigns.map((c) => (
                <tr
                  key={c.campaign_id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="font-medium text-card-foreground">{c.campaign_name}</div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="text-sm font-semibold">
                      {c.offer?.offer_name || 'No Offer Assigned'}
                    </div>
                    <div className="text-xs text-muted-foreground">{c.offer_id}</div>
                  </td>
                  <td className="py-4 px-4">
                    <CampaignStatusDropdown
                      campaignId={c.campaign_id}
                      currentStatus={c.campaign_status}
                    />
                  </td>

                  <td className="py-4 px-4">
                    <div className="text-sm text-muted-foreground ">{formatDate(c.createdat)}</div>
                  </td>

                  <td className="py-4 px-4 max-w-[300px]">
                    <div className="text-xs text-muted-foreground wrap-anywhere">
                      {c.instructions}
                    </div>
                  </td>

                  <td className="py-4 px-4 flex items-center gap-2">
                    <EditButton onClick={() => onEdit?.(c)} />
                    <DeleteButton onDelete={() => openDeleteDialog(c.campaign_id)} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={() => setIsDeleteDialogOpen(false)}
        title="Delete Campaign"
        description="Are you sure you want to delete this campaign?"
        onConfirm={handleConfirmDelete}
        loading={isLoading}
      />
    </div>
  );
}
