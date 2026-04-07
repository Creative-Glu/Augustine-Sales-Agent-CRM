export interface Product {
  product_id: string;
  product_name: string;
  product_description?: string | null;
  pricing_type: 'custom' | 'service' | 'free' | 'one-time';
  price?: number | null | string;
  created_at?: string;
}
export interface ProductFormValues {
  product_name: string;
  product_description?: string | null;
  pricing_type: 'custom' | 'service' | 'free' | 'one-time';
  price?: string | number | null;
}
