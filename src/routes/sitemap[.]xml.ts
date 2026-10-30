import { createFileRoute } from "@tanstack/react-router";
import { publicClient } from "@/lib/public.server";
import { SITE_ORIGIN } from "@/lib/seo";
import { buildSitemap, fetchAllPages, validIsoDate } from "@/lib/sitemap";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const origin = SITE_ORIGIN;
          const sb = publicClient();
          const now = new Date();
          const nowIso = now.toISOString();
          const [products, categories, collections, links] = await Promise.all([
            fetchAllPages((from, to) => sb.from("products").select("id,slug,created_at,price_updated_at,expires_at").eq("active", true).or(`expires_at.is.null,expires_at.gt.${nowIso}`).order("id").range(from, to)),
            fetchAllPages((from, to) => sb.from("categories").select("slug").eq("active", true).order("id").range(from, to)),
            fetchAllPages((from, to) => sb.from("video_collections").select("id,created_at").eq("active", true).order("id").range(from, to)),
            fetchAllPages((from, to) => sb.from("video_collection_products").select("collection_id,product_id").order("collection_id").order("product_id").range(from, to)),
          ]);
          const liveProductIds = new Set(products.map((product) => product.id));
          const liveCollections = new Set(links.filter((link) => liveProductIds.has(link.product_id)).map((link) => link.collection_id));
          const entries = [
            { path: "/" },
            { path: "/ofertas" },
            { path: "/privacidade" },
            { path: "/termos" },
            ...categories.map((category) => ({ path: `/categoria/${encodeURIComponent(category.slug)}` })),
            ...products.map((product) => ({
              path: `/produto/${encodeURIComponent(product.slug)}`,
              lastmod: [product.price_updated_at, product.created_at].map(validIsoDate).filter((date): date is string => date !== null).sort().at(-1) ?? null,
            })),
            ...collections.filter((collection) => liveCollections.has(collection.id)).map((collection) => ({
              path: `/ofertas?colecao=${encodeURIComponent(collection.id)}`,
              lastmod: validIsoDate(collection.created_at),
            })),
          ];
          return new Response(buildSitemap(origin, entries), {
            headers: { "content-type": "application/xml;charset=UTF-8", "cache-control": "public, max-age=300" },
          });
        } catch (error) {
          console.error("Sitemap generation failed", error);
          return new Response("Sitemap unavailable", { status: 503, headers: { "content-type": "text/plain;charset=UTF-8" } });
        }
      },
    },
  },
});
