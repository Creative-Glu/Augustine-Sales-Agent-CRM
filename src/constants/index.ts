import { TableHeaderColumn } from '@/components/TableHeader';

export const PRODUCT_TABLE_COLUMNS: TableHeaderColumn[] = [
  { label: 'Product Name', align: 'left' },
  { label: 'Pricing Type', align: 'left' },
  { label: 'Price', align: 'left' },
  { label: 'Created At', align: 'left' },
  { label: 'Actions', align: 'center' },
];

export const ICP_TABLE_COLUMNS: TableHeaderColumn[] = [
  { label: 'ICP Name', align: 'left' },
  { label: 'Description', align: 'left' },
  { label: 'Created At', align: 'left' },
  { label: 'Actions', align: 'center' },
];

export const PRODUCT_OFFER_COLUMNS: TableHeaderColumn[] = [
  { label: 'Offer Name' },
  { label: 'ICP' },
  { label: 'Products' },
  { label: 'Created At' },
  { label: 'Actions', align: 'center' },
];

export const CAMPAIGN_COLUMNS: TableHeaderColumn[] = [
  {
    label: 'Campaign Name',
  },
  {
    label: 'Offer Name',
  },
  {
    label: 'Status',
  },
  {
    label: 'Created At',
  },
  {
    label: 'Instruction',
  },
  {
    label: 'Actions',
  },
];
export const CAMPAIGN_STATUS_OPTIONS = ['Running', 'Active', 'Draft', 'Stopped'] as const;

export const CONTACTS_TABLE_COLUMNS: TableHeaderColumn[] = [
  { label: 'Parish / Lead', align: 'left' },
  { label: 'Contact', align: 'left' },
  { label: 'Institution / Location', align: 'left' },
  { label: 'ICP', align: 'left' },
  { label: 'Created', align: 'left' },
  { label: 'Actions', align: 'center' },
];
