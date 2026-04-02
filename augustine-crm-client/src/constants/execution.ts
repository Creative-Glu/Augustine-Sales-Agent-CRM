import type { TableHeaderColumn } from '@/components/TableHeader';

// ─── Execution Dashboard Views ─────────────────────────────────────────────

export const EXECUTION_VIEWS = ['institution', 'websites', 'jobs', 'results', 'staff', 'sync-queue'] as const;
export type ExecutionViewSegment = (typeof EXECUTION_VIEWS)[number];

// ─── Table Column Definitions ──────────────────────────────────────────────

export const STAFF_TABLE_COLUMNS: TableHeaderColumn[] = [
  { label: 'Staff', align: 'left' },
  { label: 'Parish Role', align: 'left' },
  { label: 'Contact', align: 'left' },
  { label: 'Institution', align: 'left' },
  { label: 'Status', align: 'left' },
  { label: 'Created', align: 'left' },
];

export const INSTITUTION_TABLE_COLUMNS: TableHeaderColumn[] = [
  { label: 'Institution', align: 'left' },
  { label: 'Contact', align: 'left' },
  { label: 'Address', align: 'left' },
  { label: 'Status', align: 'left' },
  { label: 'Created', align: 'left' },
];

export const JOBS_TABLE_COLUMNS: TableHeaderColumn[] = [
  { label: 'Status', align: 'left' },
  { label: 'URLs count', align: 'right' },
  { label: 'Submitted', align: 'left' },
  { label: 'Started', align: 'left' },
  { label: 'Completed', align: 'left' },
  { label: 'Execution time', align: 'right' },
  { label: 'Error', align: 'left' },
];

export const RESULTS_TABLE_COLUMNS: TableHeaderColumn[] = [
  { label: 'URL', align: 'left' },
  { label: 'Source', align: 'left' },
  { label: 'Status', align: 'left' },
  { label: 'Processed', align: 'left' },
  { label: 'Error', align: 'left' },
];

export const WEBSITES_URL_TABLE_COLUMNS: TableHeaderColumn[] = [
  { label: 'Company name', align: 'left' },
  { label: 'Company Domain', align: 'left' },
  { label: 'Website URL', align: 'left' },
  { label: 'Street Address', align: 'left' },
  { label: 'Phone Number', align: 'left' },
  { label: 'City', align: 'left' },
  { label: 'State', align: 'left' },
  { label: 'Status', align: 'left' },
];

export const SYNC_QUEUE_TABLE_COLUMNS: TableHeaderColumn[] = [
  { label: 'Queue ID', align: 'left' },
  { label: 'Entity Type', align: 'left' },
  { label: 'Entity Name', align: 'left' },
  { label: 'Status', align: 'left' },
  { label: 'Attempts', align: 'right' },
  { label: 'Next Retry', align: 'left' },
  { label: 'Last Error', align: 'left' },
  { label: 'Created', align: 'left' },
  { label: 'Actions', align: 'left' },
];

export const KPI_RECENT_JOBS_COLUMNS: TableHeaderColumn[] = [
  { label: 'Status', align: 'left' },
  { label: 'URLs', align: 'right' },
  { label: 'Submitted', align: 'left' },
  { label: 'Updated', align: 'left' },
  { label: 'Processing time', align: 'right' },
  { label: 'Error', align: 'left' },
];

export const KPI_FAILED_RESULTS_COLUMNS: TableHeaderColumn[] = [
  { label: 'URL', align: 'left' },
  { label: 'Source', align: 'left' },
  { label: 'Processed', align: 'left' },
  { label: 'Error', align: 'left' },
];

export const INSTITUTION_STAFF_MODAL_COLUMNS: TableHeaderColumn[] = [
  { label: 'Name', align: 'left' },
  { label: 'Role', align: 'left' },
  { label: 'Email', align: 'left' },
  { label: 'Contact number', align: 'left' },
  { label: 'Created', align: 'left' },
];

// ─── Status Options ────────────────────────────────────────────────────────

export const SYNC_QUEUE_STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'success', label: 'Success' },
  { value: 'failed', label: 'Failed' },
] as const;

export const SYNC_QUEUE_ENTITY_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'institution', label: 'Institution' },
  { value: 'staff', label: 'Staff' },
] as const;

// ─── Badge Variant Mappings ────────────────────────────────────────────────

export const JOB_STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'outline',
  running: 'default',
  completed: 'secondary',
  failed: 'destructive',
};

// ─── Enrichment Criteria ───────────────────────────────────────────────────

export const ENRICHMENT_CRITERIA = [
  { field: 'Name', confidence: 'High', source: 'Scraped from team/leadership pages' },
  { field: 'Job title / Role', confidence: 'High', source: 'Scraped from page context' },
  { field: 'Email', confidence: 'High', source: 'Scraped from team/leadership pages' },
  { field: 'Phone', confidence: 'Medium', source: 'Scraped where available (contact number)' },
  { field: 'Institution', confidence: 'High', source: 'Linked to the associated institution' },
] as const;

// ─── Marketing Jobs Stages ─────────────────────────────────────────────────

export const JOB_STAGES_ORDER = [
  'job_started',
  'url_processing',
  'extraction',
  'db_saving',
  'hubspot_sync',
  'completed',
] as const;
