'use client';

import { DeleteButton, EditButton } from '@/components/ActionButtons';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { TableHeader } from '@/components/TableHeader';
import { ICP_TABLE_COLUMNS } from '@/constants';
import { useToastHelpers } from '@/lib/toast';
import { useDeleteICPs } from '@/services/icps/useICPs';
import { ICPsTableProps, ICP } from '@/types/icps';
import { formatDate } from '@/utils/format';
import { useState } from 'react';

interface ICPsTablePropsWithEdit extends ICPsTableProps {
  onEdit?: (icp: ICP) => void;
}

export default function ICPsTable({
  icps,
  isLoading,
  isError,
  fetchICPs,
  onEdit,
}: ICPsTablePropsWithEdit) {
  const [selectedICPId, setSelectedICPId] = useState<string>('');
  const [isDeleteICPModalOpen, setIsDeleteICPModalOpen] = useState(false);

  const { mutateAsync: deleteICPMutate, isPending: isDeleting } = useDeleteICPs();
  const { successToast, errorToast } = useToastHelpers();

  const openDeleteICPModal = (icpId: string) => {
    setSelectedICPId(icpId);
    setIsDeleteICPModalOpen(true);
  };

  const handleDeleteICP = async () => {
    if (!selectedICPId) return;

    try {
      await deleteICPMutate(selectedICPId);
      successToast('ICP deleted successfully.');
      fetchICPs();
    } catch (error: any) {
      errorToast(error?.message || 'Failed to delete ICP.');
    } finally {
      setIsDeleteICPModalOpen(false);
    }
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full">
          <TableHeader columns={ICP_TABLE_COLUMNS} />

          <tbody>
            {/* Loading */}
            {isLoading && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-muted-foreground">
                  <div className="animate-pulse text-sm">Loading ICPs...</div>
                </td>
              </tr>
            )}

            {/* Error */}
            {isError && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-red-500">
                  Failed to load ICPs. Please try again.
                </td>
              </tr>
            )}

            {/* Empty */}
            {!isLoading && !isError && icps.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-muted-foreground">
                  No ICPs found.
                </td>
              </tr>
            )}

            {/* Data */}
            {!isLoading &&
              !isError &&
              icps.map((icp) => (
                <tr
                  key={icp.icp_id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4 font-medium text-card-foreground">{icp.icp_name}</td>

                  <td className="py-4 px-4">
                    <div className="text-sm text-muted-foreground">{icp.icp_desc || '—'}</div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="text-sm text-muted-foreground">
                      {formatDate(icp.created_at)}
                    </div>
                  </td>

                  <td className="py-4 px-4 flex items-center justify-center gap-2">
                    <EditButton onClick={() => onEdit?.(icp)} />
                    <DeleteButton onDelete={() => openDeleteICPModal(icp.icp_id)} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteDialog
        open={isDeleteICPModalOpen}
        onOpenChange={setIsDeleteICPModalOpen}
        title="Delete ICP"
        description="Are you sure you want to delete this ICP?"
        onConfirm={handleDeleteICP}
        loading={isDeleting}
      />
    </div>
  );
}
