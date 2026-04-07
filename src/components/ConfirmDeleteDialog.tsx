import { Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  onConfirm: () => void;
  loading?: boolean;
  error?: string | null;
}

export default function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title = 'Delete',
  description = 'Are you sure? This action cannot be undone.',
  onConfirm,
  loading = false,
  error,
}: ConfirmDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px] rounded-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer" disabled={loading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-destructive hover:bg-destructive/90 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>

        {error && (
          <p className="text-destructive text-sm mt-2">
            {typeof error === 'string' ? error : 'Something went wrong'}
          </p>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
