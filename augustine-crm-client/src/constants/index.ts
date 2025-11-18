import { TableHeaderColumn } from '@/components/TableHeader';

export const PRODUCT_TABLE_COLUMNS: TableHeaderColumn[] = [
  { label: 'Product Name', align: 'left' },
  { label: 'Pricing Type', align: 'left' },
  { label: 'Price', align: 'left' },
  { label: 'Created At', align: 'left' },
  { label: 'Actions', align: 'center' },
];

export const ICP_TABLE_COLUMNS: any[] = [
  { label: 'ICP Name', align: 'left' },
  { label: 'Description', align: 'left' },
  { label: 'Created At', align: 'left' },
  { label: 'Actions', align: 'center' },
];

export const PRODUCT_OFFER_COLUMNS = [
  { label: 'Offer Name' },
  { label: 'ICP' },
  { label: 'Products' },
  { label: 'Actions' },
];
