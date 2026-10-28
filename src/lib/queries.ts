import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Product = Database["public"]["Tables"]["products"]["Row"] & {
  categories?: { name: string; slug: string } | null;
};
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Banner = Database["public"]["Tables"]["banners"]["Row"];
export type Settings = Database["public"]["Tables"]["site_settings"]["Row"];

export const PRODUCT_SELECT = "*, categories(name, slug)";

export const settingsQuery = queryOptions({
  queryKey: ["settings"],
  queryFn: async () => {
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
    if (error) throw error;
    return data as Settings | null;
  },
  staleTime: 60_000,
});

export const categoriesQuery = queryOptions({
  queryKey: ["categories", "public"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("active", true)
      .order("sort_order");
    if (error) throw error;
    return data as Category[];
  },
  staleTime: 60_000,
});

export const storesQuery = queryOptions({
  queryKey: ["stores"],
  queryFn: async () => {
    const { data, error } = await supabase.from("stores").select("*").order("name");
    if (error) throw error;
    return data;
  },
});

export const bannersQuery = queryOptions({
  queryKey: ["banners", "public"],
  queryFn: async () => {
    const { data, error } = await supabase.from("banners").select("*").order("sort_order");
    if (error) throw error;
    // Admin sessions can read inactive banners too — filter for public display.
    const now = Date.now();
    return (data as Banner[]).filter(
      (b) =>
        b.active &&
        (!b.starts_at || new Date(b.starts_at).getTime() <= now) &&
        (!b.ends_at || new Date(b.ends_at).getTime() > now),
    );
  },
});

function liveFilter<T extends { eq: (c: string, v: unknown) => T; or: (f: string) => T }>(q: T) {
  return q.eq("active", true).or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);
}

export type HomeSection = "deals" | "viewed" | "clicked" | "bestsellers" | "new" | "recommended";

export const homeSectionQuery = (section: HomeSection) =>
  queryOptions({
    queryKey: ["products", "home", section],
    queryFn: async () => {
      let q = liveFilter(supabase.from("products").select(PRODUCT_SELECT));
      switch (section) {
        case "deals":
          q = q.eq("featured", true).order("updated_at", { ascending: false });
          break;
        case "viewed":
          q = q.gt("view_count", 0).order("view_count", { ascending: false });
          break;
        case "clicked":
          q = q.gt("click_count", 0).order("click_count", { ascending: false });
          break;
        case "bestsellers":
          q = q.eq("best_seller", true).order("updated_at", { ascending: false });
          break;
        case "recommended":
          q = q.eq("recommended", true).order("updated_at", { ascending: false });
          break;
        case "new":
          q = q.order("created_at", { ascending: false });
          break;
      }
      const { data, error } = await q.limit(10);
      if (error) throw error;
      return data as Product[];
    },
  });

export type SearchParams = {
  q?: string;
  categoria?: string;
  loja?: string;
  min?: number;
  max?: number;
  desconto?: boolean;
  recentes?: boolean;
  ordem?: "menor-preco" | "maior-desconto" | "recentes" | "mais-clicados";
};

export const searchProductsQuery = (p: SearchParams) =>
  queryOptions({
    queryKey: ["products", "search", p],
    queryFn: async () => {
      let categoryId: string | undefined;
      if (p.categoria) {
        const { data } = await supabase.from("categories").select("id").eq("slug", p.categoria).maybeSingle();
        if (!data) return [] as Product[];
        categoryId = data.id;
      }
      let q = liveFilter(supabase.from("products").select(PRODUCT_SELECT));
      if (categoryId) q = q.eq("category_id", categoryId);
      if (p.loja) q = q.eq("store", p.loja);
      if (p.min != null) q = q.gte("promo_price", p.min);
      if (p.max != null) q = q.lte("promo_price", p.max);
      if (p.recentes) q = q.gte("created_at", new Date(Date.now() - 7 * 864e5).toISOString());
      if (p.q) {
        const term = p.q.replace(/[,%()*]/g, " ").trim();
        if (term) q = q.or(`name.ilike.%${term}%,store.ilike.%${term}%,description.ilike.%${term}%,tags.cs.{${term.toLowerCase()}}`);
      }
      if (p.ordem === "menor-preco") q = q.order("promo_price", { ascending: true, nullsFirst: false });
      else if (p.ordem === "mais-clicados") q = q.order("click_count", { ascending: false });
      else q = q.order("created_at", { ascending: false });
      const { data, error } = await q.limit(200);
      if (error) throw error;
      let rows = data as Product[];
      const disc = (r: Product) =>
        r.original_price && r.promo_price && r.original_price > r.promo_price
          ? (r.original_price - r.promo_price) / r.original_price
          : 0;
      if (p.desconto) rows = rows.filter((r) => disc(r) > 0);
      if (p.ordem === "maior-desconto") rows = [...rows].sort((a, b) => disc(b) - disc(a));
      return rows;
    },
  });

export const productsByIdsQuery = (ids: string[]) =>
  queryOptions({
    queryKey: ["products", "ids", ids],
    queryFn: async () => {
      if (!ids.length) return [] as Product[];
      const { data, error } = await supabase.from("products").select(PRODUCT_SELECT).in("id", ids);
      if (error) throw error;
      return data as Product[];
    },
  });

export const relatedQuery = (categoryId: string | null, excludeId: string) =>
  queryOptions({
    queryKey: ["products", "related", categoryId, excludeId],
    queryFn: async () => {
      let q = liveFilter(supabase.from("products").select(PRODUCT_SELECT)).neq("id", excludeId);
      if (categoryId) q = q.eq("category_id", categoryId);
      const { data, error } = await q.order("click_count", { ascending: false }).limit(5);
      if (error) throw error;
      return data as Product[];
    },
  });
