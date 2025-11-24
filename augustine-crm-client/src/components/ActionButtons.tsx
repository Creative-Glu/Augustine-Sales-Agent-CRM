import { PencilSquareIcon } from '@heroicons/react/24/outline';

export const EditButton = ({ onClick }: { onClick?: () => void }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`inline-flex items-center justify-center p-2 text-muted-foreground 
        border border-gray-200 rounded-lg bg-white transition-colors
        ${onClick ? 'cursor-pointer hover:bg-gray-50' : 'cursor-not-allowed opacity-60'}`}
      title="Edit"
    >
      <PencilSquareIcon className="w-4 h-4" />
    </button>
  );
};
import { TrashIcon, EyeIcon } from 'lucide-react';

export const ViewButton = ({ onClick }: { onClick?: () => void }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`inline-flex items-center justify-center p-2 text-blue-700 
        border border-blue-500 rounded-lg bg-white transition-colors
        ${onClick ? 'cursor-pointer hover:bg-blue-50' : 'cursor-not-allowed opacity-60'}`}
      title="View"
    >
      <EyeIcon className="w-4 h-4" />
    </button>
  );
};

export const DeleteButton = ({ onDelete }: { onDelete: () => void }) => {
  return (
    <button
      type="button"
      className="inline-flex items-center justify-center p-2 text-red-700 
        border border-red-500 rounded-lg bg-white cursor-pointer 
        hover:bg-red-50 transition-colors"
      title="Delete"
      onClick={onDelete}
    >
      <TrashIcon className="w-4 h-4" />
    </button>
  );
};
