'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useICPsPaginated } from '@/services/icps/useICPs';
import { ICP } from '@/types/icps';
import ICPsTable from './IcpsTable';
import { PageHeader } from '@/components/PageHeader';
import { CreateButton } from '@/components/CreateButton';
import Pagination from '@/components/Pagination';
import ICPModal from './ICPModal';

const ICPViewModal = dynamic(() => import('./ICPViewModal'), { ssr: false });

const PAGE_LIMIT = 10;

const ICPs = () => {
  const searchParams = useSearchParams();
  const rawOffset = searchParams.get('offset');
  const parsed = rawOffset ? parseInt(rawOffset, 10) : 0;
  const offset = Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;

  const { data, isLoading, isError, refetch: fetchICPs } = useICPsPaginated(PAGE_LIMIT);

  const icpsData = data?.icps ?? [];
  const total = data?.total ?? 0;
  const hasMore = data?.hasMore ?? false;
  const currentPage = Math.floor(offset / PAGE_LIMIT) + 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  const [isICPModalOpen, setICPModalOpen] = React.useState(false);
  const [selectedICP, setSelectedICP] = React.useState<ICP | null>(null);
  const [viewingICP, setViewingICP] = React.useState<ICP | null>(null);

  const handleEdit = (icp: ICP) => {
    setSelectedICP(icp);
    setICPModalOpen(true);
  };

  const handleView = (icp: ICP) => {
    setViewingICP(icp);
  };

  const handleCloseModal = () => {
    setICPModalOpen(false);
    setSelectedICP(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
        <div className="p-6">
          <PageHeader
            title="ICPs"
            subtitle={
              isLoading
                ? 'Loading ICPs…'
                : `Showing ${icpsData.length} of ${total} ${total === 1 ? 'ICP' : 'ICPs'}`
            }
          >
            <CreateButton label="Create ICP" onClick={() => setICPModalOpen(true)} />
          </PageHeader>

          <ICPsTable
            icps={icpsData}
            isLoading={isLoading}
            isError={isError}
            fetchICPs={fetchICPs}
            openDeleteDialog={(id) => console.log('delete', id)}
            onEdit={handleEdit}
            onView={handleView}
          />
        </div>
      </div>

      {/* Server-side pagination — URL-driven via ?offset= */}
      {total > PAGE_LIMIT && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          currentOffset={offset}
          limit={PAGE_LIMIT}
          hasMore={hasMore}
          basePath="/icp"
          queryParamName="offset"
        />
      )}

      <ICPModal
        onCreated={fetchICPs}
        open={isICPModalOpen}
        onClose={handleCloseModal}
        icp={selectedICP}
      />

      <ICPViewModal
        open={!!viewingICP}
        onClose={() => setViewingICP(null)}
        icp={viewingICP}
      />
    </div>
  );
};

export default ICPs;
