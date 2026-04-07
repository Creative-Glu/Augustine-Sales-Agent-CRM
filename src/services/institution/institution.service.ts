import { fileUploadSupabase } from '@/lib/fileUploadSupabaseClient';

export interface FileNameCount {
  file_name: string;
  count: number;
  latest_created_at: string | null;
}

export interface FileNameCountsResponse {
  fileCounts: FileNameCount[];
  total: number;
  totalRecords: number;
  hasMore: boolean;
}

export async function getFileNameCounts(): Promise<FileNameCount[]> {
  // Fetch all records by paginating through Supabase (default limit is 1000, but we'll fetch in batches)
  const allRecords: Array<{ file_name: string | null; created_at: string | null }> = [];
  const batchSize = 1000;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await fileUploadSupabase
      .from('institution')
      .select('file_name, created_at')
      .order('created_at', { ascending: false })
      .range(offset, offset + batchSize - 1);

    if (error) {
      throw new Error(`Error fetching institution data: ${error.message}`);
    }

    if (!data || data.length === 0) {
      hasMore = false;
      break;
    }

    allRecords.push(...data);
    
    // If we got less than batchSize, we've reached the end
    if (data.length < batchSize) {
      hasMore = false;
    } else {
      offset += batchSize;
    }
  }

  if (allRecords.length === 0) {
    return [];
  }

  // Count occurrences of each file_name and track latest created_at
  const fileData: Record<string, { count: number; latest_created_at: string | null }> = {};
  
  allRecords.forEach((record) => {
    const fileName = record.file_name || 'Unknown';
    const createdAt = record.created_at || null;
    
    if (!fileData[fileName]) {
      fileData[fileName] = {
        count: 0,
        latest_created_at: createdAt,
      };
    }
    
    fileData[fileName].count += 1;
    
    // Update latest_created_at if this record is more recent
    if (createdAt && (!fileData[fileName].latest_created_at || createdAt > fileData[fileName].latest_created_at)) {
      fileData[fileName].latest_created_at = createdAt;
    }
  });

  // Convert to array and sort by latest created_at (descending - most recent first)
  const result: FileNameCount[] = Object.entries(fileData)
    .map(([file_name, { count, latest_created_at }]) => ({ 
      file_name, 
      count,
      latest_created_at 
    }))
    .sort((a, b) => {
      // Sort by latest_created_at (most recent first)
      // If created_at is null, put it at the end
      if (!a.latest_created_at && !b.latest_created_at) return 0;
      if (!a.latest_created_at) return 1;
      if (!b.latest_created_at) return -1;
      return b.latest_created_at.localeCompare(a.latest_created_at);
    });

  return result;
}

export async function getFileNameCountsPaginated(
  offset: number = 0,
  limit: number = 10
): Promise<FileNameCountsResponse> {
  // Get all file counts first (we need to group and sort)
  const allCounts = await getFileNameCounts();
  
  const total = allCounts.length;
  const totalRecords = allCounts.reduce((sum, item) => sum + item.count, 0);
  const paginatedCounts = allCounts.slice(offset, offset + limit);
  const hasMore = offset + limit < total;

  return {
    fileCounts: paginatedCounts,
    total,
    totalRecords,
    hasMore,
  };
}
