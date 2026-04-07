'use client';

import { useSearchParams } from 'next/navigation';
import { useFileNameCountsPaginated } from '@/services/institution/useInstitution';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import Pagination from '@/components/Pagination';

export default function FileNameCounts() {
  const searchParams = useSearchParams();
  const limit = 10;
  const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;
  const validOffset = isNaN(offset) || offset < 0 ? 0 : offset;

  const { data, isLoading, isError, error } = useFileNameCountsPaginated(limit);
  
  const { fileCounts, total, totalRecords, hasMore } = data || { fileCounts: [], total: 0, totalRecords: 0, hasMore: false };
  const currentPage = Math.floor(validOffset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-400 text-sm">
          Error loading file counts: {error?.message || 'Unknown error'}
        </p>
      </div>
    );
  }

  if (!fileCounts || fileCounts.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
        <p className="text-gray-500 dark:text-slate-400 text-sm">No file names found in the institution table.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
          Files Uploaded
        </h3>
        <span className="text-sm text-gray-500 dark:text-slate-400">
          Showing {fileCounts.length} of {total} unique files
        </span>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[70%]">File Name</TableHead>
              <TableHead className="w-[30%] text-center">Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fileCounts.map((item, index) => {
              return (
                <TableRow key={`${item.file_name}-${index}`}>
                  <TableCell className="font-medium">
                    {item.file_name || 'Unknown'}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-semibold">
                      {item.count}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {total > limit && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          currentOffset={validOffset}
          limit={limit}
          hasMore={hasMore}
          basePath="/upload-catholic-pdf"
          queryParamName="offset"
        />
      )}
    </div>
  );
}
