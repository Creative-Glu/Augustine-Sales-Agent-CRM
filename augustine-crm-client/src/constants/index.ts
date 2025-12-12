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
  { label: 'Actions' },
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
export const CAMPAIGN_STATUS_OPTIONS: any[] = [
  { label: 'Running', value: 'Running' },
  { label: 'Active', value: 'Active' },
  { label: 'Draft', value: 'Draft' },
  { label: 'Stopped', value: 'Stopped' },
  { label: 'AFA', value: 'AFA' },
];

export const CONTACTS_TABLE_COLUMNS: TableHeaderColumn[] = [
  { label: 'Parish Name', align: 'left' },
  { label: 'Email', align: 'left' },
  { label: 'Phone', align: 'left' },
  { label: 'Institution Type', align: 'left' },
  { label: 'ICPs', align: 'left' },
  { label: 'Actions', align: 'center' },
];
