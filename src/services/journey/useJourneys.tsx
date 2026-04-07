'use client';

import { useQuery } from '@tanstack/react-query';
import { getJourneys } from './journey.service';

export const useGetJourneys = () => {
  return useQuery({
    queryKey: ['journeys'],
    queryFn: getJourneys,
  });
};
