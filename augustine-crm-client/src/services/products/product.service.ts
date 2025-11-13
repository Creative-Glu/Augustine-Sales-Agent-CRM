import { supabase } from '@/src/lib/supabaseClient';

export interface Product {
  product_id: string;
  product_name: string;
  product_description?: string;
  pricing_type?: string;
  price?: number;
  created_at?: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  hasMore: boolean;
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Error fetching products: ${error.message}`);
  return data ?? [];
}

/**
 * Get products with pagination support
 * @param offset - Number of records to skip
 * @param limit - Number of records to return (default: 10)
 * @returns ProductsResponse with products, total count, and hasMore flag
 */
export async function getProductsPaginated(
  offset: number = 0,
  limit: number = 10
): Promise<ProductsResponse> {
  // Get total count
  const { count, error: countError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  if (countError) throw new Error(`Error fetching products count: ${countError.message}`);

  // Get paginated products
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`Error fetching products: ${error.message}`);

  const total = count ?? 0;
  const hasMore = offset + limit < total;

  return {
    products: data ?? [],
    total,
    hasMore,
  };
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('product_id', id)
    .single();

  if (error) throw new Error(`Error fetching product: ${error.message}`);
  return data;
}

/**
 * Create a new product
 */
export async function createProduct(
  product: Omit<Product, 'product_id' | 'created_at'>
): Promise<Product> {
  const { data, error } = await supabase.from('products').insert([product]).select().single();

  if (error) throw new Error(`Error creating product: ${error.message}`);
  return data;
}

/**
 * Update an existing product
 */
export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('product_id', id)
    .select()
    .single();

  if (error) throw new Error(`Error updating product: ${error.message}`);
  return data;
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('product_id', id);
  if (error) throw new Error(`Error deleting product: ${error.message}`);
}
