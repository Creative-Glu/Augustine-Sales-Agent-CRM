'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCompaign,
  deleteCompaign,
  getCompaign,
  getCampaignsPaginated,
  updateCampaignStatus,
  updateCampaign,
  CampaignsResponse,
} from './campaign.service';
import { CampaignValues } from '@/types/compaign';
import { supabase } from '@/lib/supabaseClient';

export type { CampaignsResponse };

const CAMPAIGN_QUERY_KEY = ['compaign'] as const;

/**
 * Server-side paginated campaigns. Reads `offset` from the URL query so the
 * page stays bookmarkable. Realtime subscription invalidates the entire
 * `['compaign']` cache prefix on any campaign mutation, including this hook.
 */
export const useCampaignsPaginated = (limit: number = 10) => {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const rawOffset = searchParams.get('offset');
  const parsed = rawOffset ? parseInt(rawOffset, 10) : 0;
  const offset = Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
  const status = searchParams.get('status') ?? '';

  useEffect(() => {
    const channel = supabase
      .channel('campaigns-realtime-paginated')
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

  return useQuery<CampaignsResponse, Error>({
    queryKey: [...CAMPAIGN_QUERY_KEY, 'paginated', offset, limit, status],
    queryFn: () => getCampaignsPaginated(offset, limit, status || undefined),
    staleTime: 30 * 1000,
  });
};

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
