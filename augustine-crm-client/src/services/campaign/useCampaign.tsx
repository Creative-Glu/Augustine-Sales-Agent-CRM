'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCompaign,
  deleteCompaign,
  getCompaign,
  updateCampaignStatus,
  updateCampaign,
} from './campaign.service';
import { CampaignValues } from '@/types/compaign';

export const useGetCompaign = () => {
  return useQuery({
    queryKey: ['compaign'],
    queryFn: getCompaign,
  });
};

export const useCreateCompaign = () => {
  return useMutation({
    mutationKey: ['create-compaign'],
    mutationFn: createCompaign,
  });
};

export const useDeleteCompaign = () => {
  return useMutation({
    mutationKey: ['delete-compaign'],
    mutationFn: deleteCompaign,
  });
};
export const useUpdateCampaignStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['update-campaign-status'],
    mutationFn: ({ campaignId, newStatus }: { campaignId: number | string; newStatus: string }) =>
      updateCampaignStatus(campaignId, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compaign'] });
    },
  });
};

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['update-campaign'],
    mutationFn: ({
      id,
      updates,
    }: {
      id: number | string;
      updates: Partial<CampaignValues>;
    }) => updateCampaign(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compaign'] });
    },
  });
};
