'use client';

import { DeleteButton, EditButton, ViewButton } from '@/components/ActionButtons';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { TableHeader } from '@/components/TableHeader';
import { ICP_TABLE_COLUMNS } from '@/constants';
import { useToastHelpers } from '@/lib/toast';
import { useDeleteICPs } from '@/services/icps/useICPs';
import { ICPsTableProps, ICP } from '@/types/icps';
import { formatDateTimeShort } from '@/utils/format';
import { useState } from 'react';
import { AlertCircle, Target } from 'lucide-react';

interface ICPsTablePropsWithActions extends ICPsTableProps {
  onEdit?: (icp: ICP) => void;
  onView?: (icp: ICP) => void;
}

export default function ICPsTable({
  icps,
  isLoading,
  isError,
  fetchICPs,
  onEdit,
  onView,
}: ICPsTablePropsWithActions) {
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete ICP.';
      errorToast(message);
    } finally {
      setIsDeleteICPModalOpen(false);
    }
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <TableHeader columns={ICP_TABLE_COLUMNS} />

          <tbody>
            {/* Loading skeleton */}
            {isLoading && (
              <>
                {Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td colSpan={4} className="py-2 px-3">
                      <Skeleton className="h-10 w-full" />
                    </td>
                  </tr>
                ))}
              </>
            )}

            {/* Error */}
            {!isLoading && isError && (
              <tr>
                <td colSpan={4} className="py-8">
                  <div className="flex flex-col items-center text-center gap-1.5">
                    <AlertCircle className="w-5 h-5 text-rose-500" />
                    <p className="text-sm font-medium text-rose-700 dark:text-rose-400">
                      Failed to load ICPs
                    </p>
                    <button
                      type="button"
                      onClick={fetchICPs}
                      className="text-xs font-medium text-rose-600 hover:text-rose-800 underline dark:text-rose-400"
                    >
                      Try again
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {/* Empty */}
            {!isLoading && !isError && icps.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8">
                  <div className="flex flex-col items-center text-center gap-1.5">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                      <Target className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    </div>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-200">No ICPs found</p>
                  </div>
                </td>
              </tr>
            )}

            {/* Rows */}
            {!isLoading &&
              !isError &&
              icps.map((icp) => (
                <tr
                  key={icp.icp_id}
                  className="border-b border-border last:border-0 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Name + ID */}
                  <td className="py-2 px-3 min-w-0">
                    <p
                      className="text-sm font-medium text-slate-900 truncate max-w-60 dark:text-slate-100"
                      title={icp.icp_name}
                    >
                      {icp.icp_name || '—'}
                    </p>
                    <p
                      className="text-[10px] font-mono text-slate-500 truncate dark:text-slate-400"
                      title={icp.icp_id}
                    >
                      {icp.icp_id}
                    </p>
                  </td>

                  {/* Description */}
                  <td className="py-2 px-3 min-w-0">
                    <p
                      className="text-[11px] text-slate-600 truncate max-w-80 dark:text-slate-400"
                      title={icp.icp_desc ?? ''}
                    >
                      {icp.icp_desc || (
                        <span className="text-slate-400 italic dark:text-slate-500">No description</span>
                      )}
                    </p>
                  </td>

                  {/* Created date + time */}
                  <td className="py-2 px-3 text-[11px] text-slate-500 tabular-nums whitespace-nowrap dark:text-slate-400">
                    {formatDateTimeShort(icp.created_at)}
                  </td>

                  {/* Actions */}
                  <td className="py-2 px-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <ViewButton onClick={() => onView?.(icp)} />
                      <EditButton onClick={() => onEdit?.(icp)} />
                      <DeleteButton
                        onDelete={() => openDeleteICPModal(icp.icp_id)}
                      />
                    </div>
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
        description="Are you sure you want to delete this ICP? Offers and contacts that reference it may break."
        onConfirm={handleDeleteICP}
        loading={isDeleting}
      />
    </div>
  );
}
