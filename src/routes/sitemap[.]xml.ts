import { createFileRoute } from "@tanstack/react-router";
import { publicClient } from "@/lib/public.server";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const sb = publicClient();
        const [{ data: products }, { data: cats }] = await Promise.all([
          sb.from("products").select("slug, updated_at").eq("active", true).limit(5000),
          sb.from("categories").select("slug").eq("active", true),
        ]);
        const urls = [
          `<url><loc>${origin}/</loc></url>`,
          `<url><loc>${origin}/ofertas</loc></url>`,
          ...(cats ?? []).map((c) => `<url><loc>${origin}/categoria/${c.slug}</loc></url>`),
          ...(products ?? []).map(
            (p) => `<url><loc>${origin}/produto/${p.slug}</loc><lastmod>${p.updated_at}</lastmod></url>`,
          ),
        ];
        return new Response(
          `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`,
          { headers: { "content-type": "application/xml" } },
        );
      },
    },
  },
});
