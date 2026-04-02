// ─── Centralized pagination and data-fetching constants ────────────────────
// Avoids magic numbers scattered across service and component files.

/** Default page size for execution dashboard tables. */
export const DEFAULT_PAGE_SIZE = 10;

/** Maximum rows per page allowed via URL params. */
export const MAX_PAGE_SIZE = 100;

/** Default page size for sync queue. */
export const SYNC_QUEUE_PAGE_SIZE = 50;

/** Number of recent jobs to show on overview. */
export const RECENT_JOBS_LIMIT = 8;

/** Number of recent failed results to show on overview. */
export const RECENT_FAILED_RESULTS_LIMIT = 8;

/** Maximum rows for a full CSV export. */
export const EXPORT_MAX_ROWS = 100_000;

/** Batch size for paginated export queries. */
export const EXPORT_BATCH_SIZE = 1_000;

/** Supabase batch size for fetching large tables (e.g. institutions for domain map). */
export const SUPABASE_BATCH_SIZE = 1_000;

/** Sync logs page size. */
export const SYNC_LOGS_PAGE_SIZE = 50;

/** API request timeout in milliseconds. */
export const API_TIMEOUT_MS = 30_000;
