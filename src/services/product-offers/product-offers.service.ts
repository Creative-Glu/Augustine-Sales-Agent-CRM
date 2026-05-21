import { supabase } from '@/lib/supabaseClient';
import { ProductOffer } from '@/types/product-offer';

export interface ProductOffersResponse {
  productOffers: any[];
  total: number;
  hasMore: boolean;
}

const PRODUCT_OFFERS_SELECT = `
  *,
  icp:icp_id (
    icp_id,
    icp_name,
    icp_desc,
    created_at
  ),
  offer_1_product:offer_1 (
    product_id,
    product_name,
    product_description,
    pricing_type,
    price
  ),
  offer_2_product:offer_2 (
    product_id,
    product_name,
    product_description,
    pricing_type,
    price
  ),
  offer_3_product:offer_3 (
    product_id,
    product_name,
    product_description,
    pricing_type,
    price
  )
`;

export async function getProductOffersPaginated(
  offset: number = 0,
  limit: number = 10
): Promise<ProductOffersResponse> {
  try {
    // Two parallel queries:
    //   1. Data fetch with joins for the current page.
    //   2. Count-only query (head: true) for total — runs without joins so
    //      it can't fail on RLS/permission issues with the joined tables.
    // If count fails for any reason, we fall back to data.length so the
    // page still renders rather than crashing the whole route.
    const [dataResult, countResult] = await Promise.all([
      supabase
        .from('product_offers')
        .select(PRODUCT_OFFERS_SELECT)
        .order('offer_id', { ascending: false })
        .range(offset, offset + limit - 1),
      supabase
        .from('product_offers')
        .select('offer_id', { count: 'exact', head: true }),
    ]);

    if (dataResult.error) {
      throw new Error(`Error fetching product offers: ${dataResult.error.message}`);
    }

    const productOffers = dataResult.data ?? [];
    const fallbackTotal = offset + productOffers.length + (productOffers.length === limit ? 1 : 0);
    const total = countResult.error ? fallbackTotal : countResult.count ?? fallbackTotal;

    return {
      productOffers,
      total,
      hasMore: offset + productOffers.length < total,
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error('getProductOffersPaginated failed');
  }
}

export async function getProductOffers(): Promise<any> {
  try {
    const { data, error } = await supabase.from('product_offers').select(
      `
      *,
      icp:icp_id (
        icp_id,
        icp_name,
        icp_desc,
        created_at
      ),
      offer_1_product:offer_1 (
        product_id,
        product_name,
        product_description,
        pricing_type,
        price
      ),
      offer_2_product:offer_2 (
        product_id,
        product_name,
        product_description,
        pricing_type,
        price
      ),
      offer_3_product:offer_3 (
        product_id,
        product_name,
        product_description,
        pricing_type,
        price
      )
    `
    );

    if (error) throw new Error(`Error fetching product offers: ${error.message}`);
    return data ?? [];
  } catch (error) {
    throw error instanceof Error ? error : new Error('getProductOffers failed');
  }
}
export async function deleteProductOffers(id: string | number) {
  try {
    const { error } = await supabase.from('product_offers').delete().eq('offer_id', id);
    if (error) throw new Error(`Error deleting product: ${error.message}`);
  } catch (error) {
    throw error instanceof Error ? error : new Error('deleteProductOffers failed');
  }
}

export async function createProductOffer(productOffer: ProductOffer): Promise<ProductOffer> {
  try {
    const { data, error } = await supabase
      .from('product_offers')
      .insert([productOffer])
      .select()
      .single();

    if (error) throw new Error(`Error creating product: ${error.message}`);
    return data;
  } catch (error) {
    throw error instanceof Error ? error : new Error('createProductOffer failed');
  }
}

export async function updateProductOffer(
  id: string,
  updates: Partial<ProductOffer>
): Promise<ProductOffer> {
  try {
    const { data, error } = await supabase
      .from('product_offers')
      .update(updates)
      .eq('offer_id', id)
      .select()
      .single();

    if (error) throw new Error(`Error updating product offer: ${error.message}`);
    return data;
  } catch (error) {
    throw error instanceof Error ? error : new Error('updateProductOffer failed');
  }
}
