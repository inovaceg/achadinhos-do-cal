import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function detectStore(host: string) {
  const h = host.toLowerCase();
  if (h.includes("shopee")) return "Shopee";
  if (h.includes("mercadolivre") || h.includes("mercadolibre") || h.includes("meli")) return "Mercado Livre";
  if (h.includes("amazon") || h.includes("amzn")) return "Amazon";
  if (h.includes("magazineluiza") || h.includes("magalu")) return "Magalu";
  if (h.includes("aliexpress")) return "AliExpress";
  return null;
}

function pickMeta(html: string, names: string[]) {
  for (const n of names) {
    const re = new RegExp(
      `<meta[^>]+(?:property|name|itemprop)=["']${n}["'][^>]*content=["']([^"']+)["']|<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name|itemprop)=["']${n}["']`,
      "i",
    );
    const m = html.match(re);
    const v = m?.[1] ?? m?.[2];
    if (v) return decode(v.trim());
  }
  return null;
}

function decode(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

/** Reads only public metadata (Open Graph / meta tags) the store page exposes. Never invents values. */
export const fetchLinkMetadata = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { url: string }) => z.object({ url: z.string().url().max(2000) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Acesso negado");
    const url = new URL(data.url);
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("URL inválida");
    const result: {
      title: string | null;
      image: string | null;
      description: string | null;
      price: number | null;
      store: string | null;
      finalUrl: string;
      note?: string;
    } = { title: null, image: null, description: null, price: null, store: detectStore(url.host), finalUrl: data.url };
    try {
      const res = await fetch(url.toString(), {
        redirect: "follow",
        headers: { "user-agent": "Mozilla/5.0 (compatible; AchadinhosDoCalBot/1.0)", accept: "text/html" },
        signal: AbortSignal.timeout(8000),
      });
      const finalHost = new URL(res.url).host;
      result.store = result.store ?? detectStore(finalHost);
      if (!res.ok) {
        result.note = `A loja respondeu com status ${res.status}. Preencha os dados manualmente.`;
        return result;
      }
      const html = (await res.text()).slice(0, 600_000);
      result.title = pickMeta(html, ["og:title", "twitter:title"]) ?? html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? null;
      result.image = pickMeta(html, ["og:image", "og:image:secure_url", "twitter:image"]);
      result.description = pickMeta(html, ["og:description", "description", "twitter:description"]);
      const priceStr = pickMeta(html, ["product:price:amount", "og:price:amount", "price"]);
      const n = priceStr ? Number(priceStr.replace(/[^\d.,]/g, "").replace(/\.(?=\d{3})/g, "").replace(",", ".")) : NaN;
      result.price = Number.isFinite(n) && n > 0 ? n : null;
      if (!result.title && !result.image) result.note = "A loja não disponibilizou metadados públicos. Preencha manualmente.";
    } catch {
      result.note = "Não foi possível acessar a página. Preencha os dados manualmente.";
    }
    return result;
  });
