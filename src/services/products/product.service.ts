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
    // FK chain: product_offers.offer_1 / offer_2 / offer_3 → products.product_id.
    // Setting the referencing slots to NULL first lets the parent product
    // delete without violating the FK constraints. Offers survive but the
    // vacated slot can be re-bundled later.
    //
    // Long-term fix: ALTER the three FKs to ON DELETE SET NULL on the DB
    // side so this becomes a single delete (instructions in the PR/commit).
    const [r1, r2, r3] = await Promise.all([
      supabase.from('product_offers').update({ offer_1: null }).eq('offer_1', id),
      supabase.from('product_offers').update({ offer_2: null }).eq('offer_2', id),
      supabase.from('product_offers').update({ offer_3: null }).eq('offer_3', id),
    ]);
    if (r1.error) {
      throw new Error(`Error clearing offer slot 1 references: ${r1.error.message}`);
    }
    if (r2.error) {
      throw new Error(`Error clearing offer slot 2 references: ${r2.error.message}`);
    }
    if (r3.error) {
      throw new Error(`Error clearing offer slot 3 references: ${r3.error.message}`);
    }

    const { error } = await supabase.from('products').delete().eq('product_id', id);
    if (error) throw new Error(`Error deleting product: ${error.message}`);
  } catch (error) {
    throw error instanceof Error ? error : new Error('deleteProduct failed');
  }
}

/** A product offer joined with its ICP, returned by getOffersForProduct. */
export interface AttachedProductOffer {
  offer_id: string;
  offer_name: string;
  icp_id?: string | null;
  icp?: { icp_id: string; icp_name: string } | null;
  offer_1?: string | null;
  offer_2?: string | null;
  offer_3?: string | null;
  created_at?: string | null;
}

/**
 * Find every product_offers row where the given product appears in any of
 * the three slots. Used by ProductViewModal to surface "this product is
 * bundled in these offers".
 */
export async function getOffersForProduct(productId: string): Promise<AttachedProductOffer[]> {
  try {
    const { data, error } = await supabase
      .from('product_offers')
      .select(
        `
        offer_id,
        offer_name,
        icp_id,
        offer_1,
        offer_2,
        offer_3,
        created_at,
        icp:icp_id (icp_id, icp_name)
      `
      )
      .or(
        `offer_1.eq.${productId},offer_2.eq.${productId},offer_3.eq.${productId}`
      );

    if (error) throw new Error(`Error fetching offers for product: ${error.message}`);
    return (data ?? []) as unknown as AttachedProductOffer[];
  } catch (error) {
    throw error instanceof Error ? error : new Error('getOffersForProduct failed');
  }
}
