import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type RawProduct = Tables<"products"> & { categories: Pick<Tables<"categories">, "name" | "slug"> | null; stores: Pick<Tables<"stores">, "name"> | null };
type RawCategory = Tables<"categories">;
type RawBanner = Tables<"banners">;
export type Product = Omit<Tables<"products">, "description" | "features" | "images" | "tags" | "created_at" | "price_updated_at" | "active" | "featured" | "bestseller" | "recommended" | "image_url"> & { description: string; features: string[]; images: string[]; tags: string[]; created_at: string; price_updated_at: string; active: boolean; featured: boolean; bestseller: boolean; recommended: boolean; image_url: string; promo_price: number; affiliate_url: string; main_image: string | null; best_seller: boolean; badge: string | null; store: string; click_count: number; view_count: number; categories: { name: string; slug: string } | null };
export type Category = Omit<RawCategory, "active" | "sort_order" | "description" | "icon"> & { active: boolean; sort_order: number; description: string; icon: string };
export type Banner = Omit<RawBanner, "subtitle" | "image_url" | "mobile_image_url" | "button_text" | "button_url" | "active" | "sort_order"> & { subtitle: string; image_url: string; mobile_image_url: string; button_text: string; button_url: string; active: boolean; sort_order: number; image_desktop: string; image_mobile: string };
export type Settings = Partial<Record<"site_name" | "slogan" | "logo_url" | "footer_text" | "instagram" | "tiktok" | "whatsapp" | "contact_email" | "affiliate_notice" | "seo_title" | "seo_description" | "favicon_url" | "primary_color" | "share_image_url", string>>;
export const PRODUCT_SELECT = "*, categories(name, slug), stores(name)";

export function mapCategory(row: RawCategory): Category {
  return { ...row, active: row.active ?? false, sort_order: row.sort_order ?? 0, description: row.description ?? "", icon: row.icon ?? "" };
}
export function mapBanner(row: RawBanner): Banner {
  const image = row.image_url ?? "";
  const mobileImage = row.mobile_image_url ?? image;
  return { ...row, subtitle: row.subtitle ?? "", image_url: image, mobile_image_url: mobileImage, button_text: row.button_text ?? "", button_url: row.button_url ?? "", active: row.active ?? false, sort_order: row.sort_order ?? 0, image_desktop: image, image_mobile: mobileImage };
}
export function mapProduct(row: RawProduct, popularity: Map<string, { clicks: number; views: number }> = new Map()): Product {
  return { ...row, description: row.description ?? "", features: row.features ?? [], images: row.images ?? [], videos: row.videos ?? [], tags: row.tags ?? [], created_at: row.created_at ?? "", price_updated_at: row.price_updated_at ?? "", active: row.active ?? false, featured: row.featured ?? false, bestseller: row.bestseller ?? false, recommended: row.recommended ?? false, image_url: row.image_url ?? "", promo_price: Number(row.price), affiliate_url: row.external_url ?? "", main_image: row.image_url, best_seller: row.bestseller ?? false, badge: null, store: row.stores?.name ?? "", click_count: popularity.get(row.id)?.clicks ?? 0, view_count: popularity.get(row.id)?.views ?? 0, categories: row.categories ? { name: row.categories.name ?? "", slug: row.categories.slug ?? "" } : null };
}
export const settingsQuery = queryOptions({ queryKey: ["settings"], queryFn: async () => {
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const settings: Settings = {};
  for (const key of ["site_name", "slogan", "logo_url", "footer_text", "instagram", "tiktok", "whatsapp", "contact_email", "affiliate_notice", "seo_title", "seo_description", "favicon_url", "primary_color", "share_image_url"] as const) { const value = data[key]; if (typeof value === "string") settings[key] = value; }
  return settings;
}, staleTime: 60_000 });
export const categoriesQuery = queryOptions({ queryKey: ["categories", "public"], queryFn: async () => {
  const { data, error } = await supabase.from("categories").select("*").eq("active", true).order("sort_order");
  if (error) throw error; return (data ?? []).map(mapCategory);
}, staleTime: 60_000 });
export const storesQuery = queryOptions({ queryKey: ["stores"], queryFn: async () => { const { data, error } = await supabase.from("stores").select("*").order("name"); if (error) throw error; return data; } });
export const bannersQuery = queryOptions({ queryKey: ["banners", "public"], queryFn: async () => {
  const { data, error } = await supabase.from("banners").select("*").order("sort_order"); if (error) throw error;
  const now = Date.now(); return (data ?? []).filter(b => b.active && (!b.starts_at || new Date(b.starts_at).getTime() <= now) && (!b.ends_at || new Date(b.ends_at).getTime() > now)).map(mapBanner);
} });
export type HomeSection = "deals" | "viewed" | "clicked" | "bestsellers" | "new" | "recommended";
const liveProducts = () => supabase.from("products").select(PRODUCT_SELECT).eq("active", true).or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);
const popularityMap = (counts: { product_id: string; clicks: number; views: number }[] | null) => new Map((counts ?? []).map(x => [x.product_id, { clicks: x.clicks, views: x.views }]));
export const homeSectionQuery = (section: HomeSection) => queryOptions({ queryKey: ["products", "home", section], queryFn: async () => {
  if (section === "viewed" || section === "clicked") {
    const { data: counts, error } = await supabase.rpc("product_popularity"); if (error) throw error;
    const ranked = [...(counts ?? [])].sort((a, b) => section === "viewed" ? b.views - a.views : b.clicks - a.clicks).filter(x => section === "viewed" ? x.views > 0 : x.clicks > 0).slice(0, 40);
    if (!ranked.length) return [];
    const { data, error: productError } = await liveProducts().in("id", ranked.map(x => x.product_id)); if (productError) throw productError;
    const pop = popularityMap(counts); return (data ?? []).map(row => mapProduct(row, pop)).sort((a, b) => section === "viewed" ? b.view_count - a.view_count : b.click_count - a.click_count).slice(0, 10);
  }
  let query = liveProducts();
  if (section === "deals") query = query.eq("featured", true);
  if (section === "bestsellers") query = query.eq("bestseller", true);
  if (section === "recommended") query = query.eq("recommended", true);
  const { data, error } = await query.order("created_at", { ascending: false }).limit(10); if (error) throw error;
  return (data ?? []).map(row => mapProduct(row));
} });
export type SearchParams = { q?: string | undefined; categoria?: string | undefined; loja?: string | undefined; colecao?: string | undefined; min?: number | undefined; max?: number | undefined; desconto?: boolean | undefined; recentes?: boolean | undefined; ordem?: "menor-preco" | "maior-desconto" | "recentes" | "mais-clicados" | undefined };
export const searchProductsQuery = (p: SearchParams) => queryOptions({ queryKey: ["products", "search", p], queryFn: async () => {
  if (p.ordem === "maior-desconto") {
    const { data: ranked, error: rankError } = await supabase.rpc("discount_product_ids", {
      p_category_slug: p.categoria ?? null, p_store_name: p.loja ?? null, p_collection: p.colecao ?? null,
      p_query: p.q ?? null, p_min: p.min ?? null, p_max: p.max ?? null, p_recent: !!p.recentes,
    });
    if (rankError) throw rankError;
    const ids = ranked?.map((row) => row.product_id) ?? [];
    if (!ids.length) return [];
    const { data, error } = await liveProducts().in("id", ids);
    if (error) throw error;
    const byId = new Map((data ?? []).map((row) => [row.id, mapProduct(row)]));
    return ids.flatMap((id) => { const product = byId.get(id); return product ? [product] : []; });
  }
  let query = liveProducts();
  if (p.colecao) {
    const { data: links, error } = await supabase.from("video_collection_products").select("product_id, video_collections!inner(active)").eq("collection_id", p.colecao).eq("video_collections.active", true);
    if (error) throw error;
    const ids = links?.map((link) => link.product_id) ?? [];
    if (!ids.length) return [];
    query = query.in("id", ids);
  }
  if (p.min != null) query = query.gte("price", p.min);
  if (p.max != null) query = query.lte("price", p.max);
  if (p.categoria) {
    const { data: category, error } = await supabase.from("categories").select("id").eq("slug", p.categoria).maybeSingle();
    if (error) throw error;
    if (!category) return [];
    query = query.eq("category_id", category.id);
  }
  if (p.loja) { const { data: store, error } = await supabase.from("stores").select("id").eq("name", p.loja).maybeSingle(); if (error) throw error; if (!store) return []; query = query.eq("store_id", store.id); }
  if (p.recentes) query = query.gte("created_at", new Date(Date.now() - 7 * 864e5).toISOString());
  if (p.q) {
    const term = p.q.replace(/[\\\\,%()_*]/g, " ").trim();
    if (term) query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%`);
  }
  query = query.order(p.ordem === "menor-preco" ? "price" : "created_at", { ascending: p.ordem === "menor-preco" });
  const { data, error } = await query.limit(200); if (error) throw error;
  const { data: counts, error: countError } = await supabase.rpc("product_popularity"); if (countError) throw countError;
  const pop = popularityMap(counts);
  let rows = (data ?? []).map(row => mapProduct(row, pop));
  const discount = (x: Product) => x.original_price && x.promo_price < x.original_price ? (x.original_price - x.promo_price) / x.original_price : 0;
  if (p.desconto) rows = rows.filter(x => discount(x) > 0);
  if (p.ordem === "mais-clicados") rows.sort((a, b) => b.click_count - a.click_count);
  return rows;
} });
export const productsByIdsQuery = (ids: string[]) => queryOptions({ queryKey: ["products", "ids", ids], queryFn: async () => {
  if (!ids.length) return [] as Product[]; const { data, error } = await liveProducts().in("id", ids); if (error) throw error; return (data ?? []).map(row => mapProduct(row));
} });
export const relatedQuery = (categoryId: string | null, excludeId: string) => queryOptions({ queryKey: ["products", "related", categoryId, excludeId], queryFn: async () => {
  if (!categoryId) return [];
  const { data, error } = await liveProducts().eq("category_id", categoryId).neq("id", excludeId).order("created_at", { ascending: false }).limit(5);
  if (error) throw error; return (data ?? []).map(row => mapProduct(row));
} });
