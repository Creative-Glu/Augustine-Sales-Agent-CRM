import { supabase } from '@/lib/supabaseClient';
import { ProductOffer } from '@/types/product-offer';

export async function getProductOffers(): Promise<any> {
  const { data, error } = await supabase.from('product_offers').select(
    `
      *,
      icp:icp_id (
        icp_id,
        icp_name
      ),
      offer_1_product:offer_1 (
        product_id,
        product_name
      ),
      offer_2_product:offer_2 (
        product_id,
        product_name
      ),
      offer_3_product:offer_3 (
        product_id,
        product_name
      )
    `
  );

  if (error) throw new Error(`Error fetching products: ${error.message}`);
  return data ?? [];
}
export async function deleteProductOffers(id: string | number) {
  const { error } = await supabase.from('product_offers').delete().eq('offer_id', id);
  if (error) throw new Error(`Error deleting product: ${error.message}`);
}

export async function createProductOffer(productOffer: ProductOffer): Promise<ProductOffer> {
  const { data, error } = await supabase
    .from('product_offers')
    .insert([productOffer])
    .select()
    .single();

  if (error) throw new Error(`Error creating product: ${error.message}`);
  return data;
}
