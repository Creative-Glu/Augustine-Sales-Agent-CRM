'use client';

import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';

interface FormFooterActionsProps {
  onCancel: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
}

export function FormFooterActions({
  onCancel,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  isSubmitting = false,
}: FormFooterActionsProps) {
  return (
    <div className="flex justify-end gap-3 pt-2">
      <Button
        type="button"
        variant="outline"
        className="cursor-pointer"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        {cancelLabel}
      </Button>

      <LoadingButton type="submit" isLoading={isSubmitting}>
        {submitLabel}
      </LoadingButton>
    </div>
  );
}
