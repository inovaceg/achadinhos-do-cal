import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const videoCollectionsQuery = queryOptions({ queryKey: ["video-collections", "public"], queryFn: async () => {
  const { data, error } = await supabase.from("video_collections").select("id,title,cover_url,video_url,sort_order,video_collection_products(product_id,sort_order,products!inner(id,active,expires_at))").eq("active", true).order("sort_order");
  if (error) throw error;
  const now = Date.now();
  return (data ?? []).map((collection) => ({ ...collection, product_ids: collection.video_collection_products.filter((entry) => entry.products.active && (!entry.products.expires_at || new Date(entry.products.expires_at).getTime() > now)).sort((a, b) => a.sort_order - b.sort_order).map((entry) => entry.product_id) }));
}, staleTime: 60_000 });
export const promotionalBannersQuery = queryOptions({ queryKey: ["promotional-banners", "public"], queryFn: async () => {
  const { data, error } = await supabase.from("promotional_banners").select("*, categories!promotional_banners_category_id_fkey(slug,active), video_collections!promotional_banners_collection_id_fkey(id,active,video_collection_products(product_id,products!inner(active,expires_at)))").eq("active", true).order("sort_order");
  if (error) throw error;
  const now = Date.now();
  return (data ?? []).filter((banner) => banner.category_id ? banner.categories?.active : banner.video_collections?.active && banner.video_collections.video_collection_products.some((entry) => entry.products.active && (!entry.products.expires_at || new Date(entry.products.expires_at).getTime() > now)));
}, staleTime: 60_000 });
export const categoryExactCountQuery = (categoryId: string) => queryOptions({ queryKey: ["category-count", categoryId], queryFn: async () => {
  const { count, error } = await supabase.from("products").select("id", { count: "exact", head: true }).eq("category_id", categoryId).eq("active", true).or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);
  if (error) throw error;
  return count ?? 0;
}, staleTime: 60_000 });
