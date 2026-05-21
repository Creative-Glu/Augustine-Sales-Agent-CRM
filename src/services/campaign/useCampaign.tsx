'use client';

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCompaign,
  deleteCompaign,
  getCompaign,
  updateCampaignStatus,
  updateCampaign,
} from './campaign.service';
import { CampaignValues } from '@/types/compaign';
import { supabase } from '@/lib/supabaseClient';

const CAMPAIGN_QUERY_KEY = ['compaign'] as const;

export const useGetCompaign = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('campaigns-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'campaigns' },
        () => {
          queryClient.invalidateQueries({ queryKey: CAMPAIGN_QUERY_KEY });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: CAMPAIGN_QUERY_KEY,
    queryFn: getCompaign,
  });
};

export const useCreateCompaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['create-compaign'],
    mutationFn: createCompaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compaign'] });
    },
  });
};

export const useDeleteCompaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['delete-compaign'],
    mutationFn: deleteCompaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compaign'] });
    },
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
