import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { publicClient } from "./public.server";

export const getProductPage = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const nowIso = new Date().toISOString();
    const { data: product } = await sb
      .from("products")
      .select("*, categories(name, slug)")
      .eq("slug", data.slug)
      .eq("active", true)
      .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
      .maybeSingle();
    if (!product) return { product: null, images: [], origin: originOf() };
    const { data: images } = await sb
      .from("product_images")
      .select("url, sort_order")
      .eq("product_id", product.id)
      .order("sort_order");
    return { product, images: images ?? [], origin: originOf() };
  });

export const getCategoryMeta = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ data }) => {
    const { data: cat } = await publicClient()
      .from("categories")
      .select("id, name, slug, description")
      .eq("slug", data.slug)
      .eq("active", true)
      .maybeSingle();
    return cat;
  });

function originOf() {
  try {
    return new URL(getRequest().url).origin;
  } catch {
    return "";
  }
}
