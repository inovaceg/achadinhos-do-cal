import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { publicClient } from "./public.server";
import { mapProduct, PRODUCT_SELECT } from "./queries";

export const getProductPage = createServerFn({ method: "GET" }).inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(120) }).parse(d)).handler(async ({ data }) => {
  const sb = publicClient(); const nowIso = new Date().toISOString();
  const { data: row, error } = await sb.from("products").select(PRODUCT_SELECT).eq("slug", data.slug).eq("active", true).or(`expires_at.is.null,expires_at.gt.${nowIso}`).maybeSingle();
  if (error) throw error;
  if (!row) return { product: null, images: [], origin: originOf() };
  const product = mapProduct(row);
  return { product, images: product.images.map((url, sort_order) => ({ url, sort_order })), origin: originOf() };
});
export const getCategoryMeta = createServerFn({ method: "GET" }).inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(120) }).parse(d)).handler(async ({ data }) => {
  const { data: cat } = await publicClient().from("categories").select("id, name, slug, description").eq("slug", data.slug).eq("active", true).maybeSingle(); return cat;
});
function originOf() { try { return new URL(getRequest().url).origin; } catch { return ""; } }
