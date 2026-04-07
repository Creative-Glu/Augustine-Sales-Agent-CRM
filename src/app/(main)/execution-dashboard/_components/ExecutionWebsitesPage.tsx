'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import Pagination from '@/components/Pagination';
import { useWebsitesUrlPaginated } from '@/services/execution/useExecutionData';
import { usePaginationParams } from '@/hooks/usePaginationParams';
import { WebsitesUrlFilters } from './ExecutionFilters';
import WebsitesUrlTable from './WebsitesUrlTable';

export default function ExecutionWebsitesPage() {
  const { offset, limit, setLimit, basePath, paginationMeta } = usePaginationParams();

  const websitesQuery = useWebsitesUrlPaginated();
  const total = websitesQuery.data?.total ?? 0;
  const { totalPages, currentPage, hasMore, showPagination } = paginationMeta(total);

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-6">
          <WebsitesUrlFilters />
          <div className="flex items-center justify-between gap-4 flex-wrap py-4 border-b border-border/60">
            <p className="text-sm text-muted-foreground font-medium">
              Showing{' '}
              <span className="text-foreground">{websitesQuery.data?.data?.length ?? 0}</span>
              {' of '}
              <span className="text-foreground">{total}</span> website URLs
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Per page</span>
                <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
                  <SelectTrigger className="w-[72px] h-9 border-border/80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => websitesQuery.refetch()}
              >
                <ArrowPathIcon className="w-4 h-4 shrink-0" />
                Refresh
              </Button>
            </div>
          </div>

          <WebsitesUrlTable
            rows={websitesQuery.data?.data ?? []}
            isLoading={websitesQuery.isLoading}
            isError={websitesQuery.isError}
            onRetry={() => websitesQuery.refetch()}
          />
        </div>
      </div>

      {showPagination && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          currentOffset={offset}
          limit={limit}
          hasMore={hasMore}
          basePath={basePath}
          queryParamName="offset"
        />
      )}
    </div>
  );
}
