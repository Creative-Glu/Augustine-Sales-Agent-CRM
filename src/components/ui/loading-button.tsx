'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ButtonProps = React.ComponentProps<typeof Button>;

interface LoadingButtonProps extends ButtonProps {
  /** When true, button shows a spinner, is disabled, and swaps label for `loadingText`. */
  isLoading?: boolean;
  /** Text shown while loading. Defaults to "<children>…". */
  loadingText?: React.ReactNode;
}

/**
 * Standardised loading button. Spinner appears inline, button disables itself,
 * cursor flips to not-allowed, and the label changes to `loadingText` (or
 * "<children>…" if not provided).
 */
export function LoadingButton({
  isLoading = false,
  loadingText,
  children,
  disabled,
  className,
  ...rest
}: LoadingButtonProps) {
  const computedLoadingText =
    loadingText ?? (typeof children === 'string' ? `${children}…` : children);

  return (
    <Button
      {...rest}
      disabled={isLoading || disabled}
      aria-busy={isLoading}
      className={cn('cursor-pointer disabled:cursor-not-allowed', className)}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          <span>{computedLoadingText}</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
}
