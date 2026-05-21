'use client';

import { useMemo, useState } from 'react';
import {
  useGetJourneys,
  JourneyFilters as ServiceJourneyFilters,
} from '@/services/journey/useJourneys';
import LeadJourneyChart from './LeadJourneyChart';
import JourneyFilters, {
  DEFAULT_JOURNEY_FILTERS,
  JourneyFilterState,
} from './JourneyFilters';
import JourneyKpiTiles from './JourneyKpiTiles';
import JourneyCharts from './JourneyCharts';
import JourneyTable from './JourneyTable';

const DAY_MS = 24 * 60 * 60 * 1000;
const DATE_RANGE_DAYS: Record<string, number | null> = {
  all: null,
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

function toServiceFilters(state: JourneyFilterState): ServiceJourneyFilters {
  const days = DATE_RANGE_DAYS[state.dateRange];
  const dateFromIso = days != null ? new Date(Date.now() - days * DAY_MS).toISOString() : undefined;

  return {
    search: state.search.trim() || undefined,
    stage: state.stage,
    campaignId: state.campaign,
    institutionType: state.institutionType,
    dateFromIso,
  };
}

const JourneyPage = () => {
  const [filters, setFilters] = useState<JourneyFilterState>(DEFAULT_JOURNEY_FILTERS);
  const serviceFilters = useMemo(() => toServiceFilters(filters), [filters]);

  const aggregate = useGetJourneys(serviceFilters);
  const allFiltered = aggregate.data ?? [];

  const campaignOptions = useMemo(() => {
    const map = new Map<string, string>();
    allFiltered.forEach((j) => {
      if (j.campaigns) {
        map.set(
          String(j.campaigns.campaign_id),
          j.campaigns.campaign_name || `Campaign #${j.campaigns.campaign_id}`
        );
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [allFiltered]);

  const institutionTypeOptions = useMemo(() => {
    const set = new Set<string>();
    allFiltered.forEach((j) => {
      const t = j.lead?.['Institution Type'];
      if (t) set.add(t);
    });
    return Array.from(set).sort();
  }, [allFiltered]);

  return (
    <div className="space-y-5">
      <JourneyFilters
        filters={filters}
        onChange={setFilters}
        campaignOptions={campaignOptions}
        institutionTypeOptions={institutionTypeOptions}
      />

      <JourneyKpiTiles journeys={allFiltered} />

      <LeadJourneyChart journeys={allFiltered} isLoading={aggregate.isLoading} />

      <JourneyCharts journeys={allFiltered} />

      <JourneyTable
        journeys={allFiltered}
        isLoading={aggregate.isLoading}
        isError={aggregate.isError}
      />
    </div>
  );
};

export default JourneyPage;
