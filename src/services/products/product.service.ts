import { supabase } from '@/lib/supabaseClient';
import { Product } from '@/types/product';

// export interface Product {
//   product_id: string;
//   product_name: string;
//   product_description?: string;
//   pricing_type?: string;
//   price?: number;
//   created_at?: string;
// }

export interface ProductsResponse {
  products: Product[];
  total: number;
  hasMore: boolean;
}

export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Error fetching products: ${error.message}`);
    return data ?? [];
  } catch (error) {
    throw error instanceof Error ? error : new Error('getProducts failed');
  }
}

export async function getProductsPaginated(
  offset: number = 0,
  limit: number = 10
): Promise<ProductsResponse> {
  try {
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
  } catch (error) {
    throw error instanceof Error ? error : new Error('getProductsPaginated failed');
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase.from('products').select('*').eq('product_id', id).single();

    if (error) throw new Error(`Error fetching product: ${error.message}`);
    return data;
  } catch (error) {
    throw error instanceof Error ? error : new Error('getProductById failed');
  }
}

export async function createProduct(product: Product): Promise<Product> {
  try {
    const { data, error } = await supabase.from('products').insert([product]).select().single();

    if (error) throw new Error(`Error creating product: ${error.message}`);
    return data;
  } catch (error) {
    throw error instanceof Error ? error : new Error('createProduct failed');
  }
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('product_id', id)
      .select()
      .single();

    if (error) throw new Error(`Error updating product: ${error.message}`);
    return data;
  } catch (error) {
    throw error instanceof Error ? error : new Error('updateProduct failed');
  }
}

export async function deleteProduct(id: string | number) {
  try {
    const { error } = await supabase.from('products').delete().eq('product_id', id);
    if (error) throw new Error(`Error deleting product: ${error.message}`);
  } catch (error) {
    throw error instanceof Error ? error : new Error('deleteProduct failed');
  }
}
