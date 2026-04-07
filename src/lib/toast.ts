import { useErrorToast, useSuccessToast } from '@/hooks/use-toast';

export function useToastHelpers() {
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();

  return {
    successToast,
    errorToast,
  };
}
