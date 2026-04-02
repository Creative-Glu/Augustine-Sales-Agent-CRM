// ─── Dry Run Tool (CSV Merge) Constants ────────────────────────────────────

export type FilterCategory = 'new_scraped' | 'updated' | 'matched_no_changes' | 'hubspot_only';

export type SortOption =
  | 'record_group'
  | 'company_asc'
  | 'company_desc'
  | 'email_present'
  | 'email_missing';

export const FILTER_CONFIG: Record<FilterCategory, { label: string; color: string; bgColor: string; borderColor: string; description: string }> = {
  new_scraped: {
    label: 'New Scraped',
    color: 'text-amber-700 dark:text-amber-300',
    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
    borderColor: 'border-amber-200 dark:border-amber-800/40',
    description: 'Only in CRM — will be added to HubSpot',
  },
  updated: {
    label: 'Updated',
    color: 'text-green-700 dark:text-green-300',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    borderColor: 'border-green-200 dark:border-green-800/40',
    description: 'Matched — blank fields will be filled',
  },
  matched_no_changes: {
    label: 'Matched - No Changes',
    color: 'text-indigo-700 dark:text-indigo-300',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
    borderColor: 'border-indigo-200 dark:border-indigo-800/40',
    description: 'Found in both files — already complete',
  },
  hubspot_only: {
    label: 'HubSpot Only',
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800/40',
    description: 'Only in HubSpot — not in CRM data',
  },
};

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'record_group', label: 'Record Group Priority' },
  { value: 'company_asc', label: 'Company A → Z' },
  { value: 'company_desc', label: 'Company Z → A' },
  { value: 'email_present', label: 'Has Email First' },
  { value: 'email_missing', label: 'Missing Email First' },
];

export const RECORD_GROUP_SORT_PRIORITY: Record<string, number> = {
  new_scraped: 0,
  updated: 1,
  matched_no_changes: 2,
  hubspot_only: 3,
};
