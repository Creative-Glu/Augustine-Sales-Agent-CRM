import { PencilSquareIcon } from '@heroicons/react/24/outline';

export const EditButton = ({ onClick }: { onClick?: () => void }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`inline-flex items-center justify-center p-2 text-amber-700 dark:text-amber-400
        border border-amber-500 dark:border-amber-500/40 rounded-lg bg-card transition-colors
        ${onClick ? 'cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-500/10' : 'cursor-not-allowed opacity-60'}`}
      title="Edit"
    >
      <PencilSquareIcon className="w-4 h-4" />
    </button>
  );
};
import { TrashIcon, EyeIcon, Activity } from 'lucide-react';

export const ViewButton = ({ onClick }: { onClick?: () => void }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`inline-flex items-center justify-center p-2 text-blue-700 dark:text-blue-400
        border border-blue-500 dark:border-blue-500/40 rounded-lg bg-card transition-colors
        ${onClick ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-500/10' : 'cursor-not-allowed opacity-60'}`}
      title="View"
    >
      <EyeIcon className="w-4 h-4" />
    </button>
  );
};

export const ActivityButton = ({ onClick }: { onClick?: () => void }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`inline-flex items-center justify-center p-2 text-emerald-700 dark:text-emerald-400
        border border-emerald-500 dark:border-emerald-500/40 rounded-lg bg-card transition-colors
        ${onClick ? 'cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-500/10' : 'cursor-not-allowed opacity-60'}`}
      title="Activity logs"
    >
      <Activity className="w-4 h-4" />
    </button>
  );
};

export const DeleteButton = ({ onDelete }: { onDelete: () => void }) => {
  return (
    <button
      type="button"
      className="inline-flex items-center justify-center p-2 text-red-700 dark:text-red-400
        border border-red-500 dark:border-red-500/40 rounded-lg bg-card cursor-pointer
        hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
      title="Delete"
      onClick={onDelete}
    >
      <TrashIcon className="w-4 h-4" />
    </button>
  );
};
