'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  useGetJourneys,
  useJourneysPaginated,
  JourneyFilters as ServiceJourneyFilters,
} from '@/services/journey/useJourneys';
import Pagination from '@/components/Pagination';
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

const PAGE_LIMIT = 10;

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
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<JourneyFilterState>(DEFAULT_JOURNEY_FILTERS);
  const serviceFilters = useMemo(() => toServiceFilters(filters), [filters]);

  const rawOffset = searchParams.get('offset');
  const parsed = rawOffset ? parseInt(rawOffset, 10) : 0;
  const offset = Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;

  const paginated = useJourneysPaginated(PAGE_LIMIT, serviceFilters);
  const aggregate = useGetJourneys(serviceFilters);

  const paginatedData = paginated.data || { journeys: [], total: 0, hasMore: false };
  const allFiltered = aggregate.data ?? [];

  // Reset offset whenever filters change so user lands on page 1 of the new result set.
  useEffect(() => {
    if (offset !== 0 && searchParams.get('offset')) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('offset');
      router.replace(`/journey${params.toString() ? `?${params.toString()}` : ''}`, {
        scroll: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.search,
    filters.stage,
    filters.campaign,
    filters.institutionType,
    filters.dateRange,
  ]);

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

  const currentPage = Math.floor(offset / PAGE_LIMIT) + 1;
  const totalPages = Math.max(1, Math.ceil(paginatedData.total / PAGE_LIMIT));

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
        journeys={paginatedData.journeys}
        total={paginatedData.total}
        offset={offset}
        limit={PAGE_LIMIT}
        isLoading={paginated.isLoading}
        isError={paginated.isError}
      />

      {paginatedData.total > PAGE_LIMIT && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          currentOffset={offset}
          limit={PAGE_LIMIT}
          hasMore={paginatedData.hasMore}
          basePath="/journey"
          queryParamName="offset"
        />
      )}
    </div>
  );
};

export default JourneyPage;
