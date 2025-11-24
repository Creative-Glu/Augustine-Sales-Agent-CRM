'use client';

import { useGetICPs } from '@/services/icps/useICPs';
import { ICP } from '@/types/icps';
import ICPsTable from './IcpsTable';
import { PageHeader } from '@/components/PageHeader';
import { CreateButton } from '@/components/CreateButton';
import React from 'react';
import ICPModal from './ICPModal';

const ICPs = () => {
  const { data: icpsData, isLoading, isError, refetch: fetchICPs } = useGetICPs();

  const [isICPModalOpen, setICPModalOpen] = React.useState(false);
  const [selectedICP, setSelectedICP] = React.useState<ICP | null>(null);

  const handleEdit = (icp: ICP) => {
    setSelectedICP(icp);
    setICPModalOpen(true);
  };

  const handleCloseModal = () => {
    setICPModalOpen(false);
    setSelectedICP(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
        <div className="p-6">
          <PageHeader title="ICPs" subtitle={`Showing ${icpsData?.length ?? 0} ICPs`}>
            <CreateButton label="Create ICP" onClick={() => setICPModalOpen(true)} />
          </PageHeader>

          <ICPsTable
            icps={icpsData ?? []}
            isLoading={isLoading}
            isError={isError}
            fetchICPs={fetchICPs}
            openDeleteDialog={(id) => console.log('delete', id)}
            onEdit={handleEdit}
          />
        </div>
      </div>

      <ICPModal
        onCreated={fetchICPs}
        open={isICPModalOpen}
        onClose={handleCloseModal}
        icp={selectedICP}
      />
    </div>
  );
};

export default ICPs;
