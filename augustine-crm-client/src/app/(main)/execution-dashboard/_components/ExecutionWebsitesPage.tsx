'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
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
import { WebsitesUrlFilters } from './ExecutionFilters';
import WebsitesUrlTable from './WebsitesUrlTable';

const DEFAULT_LIMIT = 10;

function getLimit(searchParams: URLSearchParams): number {
  const v = searchParams.get('limit');
  const n = v ? parseInt(v, 10) : NaN;
  return Number.isNaN(n) || n < 1 ? DEFAULT_LIMIT : Math.min(n, 100);
}

function getOffset(searchParams: URLSearchParams): number {
  const v = searchParams.get('offset');
  const n = v ? parseInt(v, 10) : NaN;
  return Number.isNaN(n) || n < 0 ? 0 : n;
}

export default function ExecutionWebsitesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const basePath = pathname ?? '/execution-dashboard/websites';
  const limit = getLimit(searchParams);
  const offset = getOffset(searchParams);

  const websitesQuery = useWebsitesUrlPaginated();
  const total = websitesQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.floor(offset / limit) + 1;
  const hasMore = offset + limit < total;
  const showPagination = total > limit;

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
                <Select
                  value={String(limit)}
                  onValueChange={(v) => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('limit', v);
                    params.delete('offset');
                    router.push(`${basePath}?${params.toString()}`);
                  }}
                >
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
