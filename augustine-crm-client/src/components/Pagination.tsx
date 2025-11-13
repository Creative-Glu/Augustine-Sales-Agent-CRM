'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  currentOffset: number;
  limit: number;
  hasMore: boolean;
  basePath: string;
  queryParamName?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  currentOffset,
  limit,
  hasMore,
  basePath,
  queryParamName = 'offset',
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateOffset = (newOffset: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newOffset === 0) {
      params.delete(queryParamName);
    } else {
      params.set(queryParamName, newOffset.toString());
    }
    router.push(`${basePath}?${params.toString()}`);
  };

  const goToPage = (page: number) => {
    const newOffset = (page - 1) * limit;
    updateOffset(newOffset);
  };

  const goToPrevious = () => {
    if (currentOffset > 0) {
      updateOffset(Math.max(0, currentOffset - limit));
    }
  };

  const goToNext = () => {
    if (hasMore) {
      updateOffset(currentOffset + limit);
    }
  };

  // Calculate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>

      <div className="flex items-center gap-2">
        {/* Previous button */}
        <button
          onClick={goToPrevious}
          disabled={currentOffset === 0}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-card-foreground bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Previous
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                onClick={() => goToPage(pageNum)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-card-foreground bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        <button
          onClick={goToNext}
          disabled={!hasMore}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-card-foreground bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

