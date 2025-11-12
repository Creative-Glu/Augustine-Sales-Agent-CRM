import { supabase } from '@/src/lib/supabaseClient';

export interface Product {
  id: string;
  name: string;
  price?: number;
  category?: string;
  created_at?: string;
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Error fetching products: ${error.message}`);
  return data ?? [];
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single();

  if (error) throw new Error(`Error fetching product: ${error.message}`);
  return data;
}

/**
 * Create a new product
 */
export async function createProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
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
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Error updating product: ${error.message}`);
  return data;
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw new Error(`Error deleting product: ${error.message}`);
}
