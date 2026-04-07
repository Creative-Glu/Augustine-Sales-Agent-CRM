'use client';

import { useGetJourneys } from '@/services/journey/useJourneys';
import LeadJourneyChart from './LeadJourneyChart';
import LeadJourneyDashboard from './LeadJourneyDashboard';
import { Journey } from '@/types/Journey';

const JourneyPage = () => {
  const { data: journeyData, isLoading, isError } = useGetJourneys();

  const journeys: Journey[] = Array.isArray(journeyData) ? journeyData : [];

  return (
    <>
      <LeadJourneyChart journeys={journeys} isLoading={isLoading} />
      {/* <LeadJourneyDashboard journeys={journeys} isLoading={isLoading} /> */}
    </>
  );
};

export default JourneyPage;
