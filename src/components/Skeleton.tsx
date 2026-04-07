'use client';

import React from 'react';
import clsx from 'clsx';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  rounded?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  rounded = '0.5rem',
  className,
  ...props
}) => {
  return (
    <div
      className={clsx('animate-pulse bg-gray-200 dark:bg-gray-700', className)}
      style={{
        width,
        height,
        borderRadius: rounded,
      }}
      {...props}
    />
  );
};
