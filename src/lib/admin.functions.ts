import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { categoryInput, productInput } from "@/lib/admin.schemas";

const uuid = z.string().uuid();
type AdminClient = SupabaseClient<Database>;

async function assertAdmin(client: AdminClient, userId: string) {
  const { data, error } = await client.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error || data !== true) throw new Error("Acesso negado: esta conta não tem permissão de administrador.");
}
function makeSlug(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 110) || "item";
}
async function uniqueSlug(client: AdminClient, table: "products" | "categories", wanted: string, id?: string) {
  const base = makeSlug(wanted);
  for (let index = 0; index < 100; index++) {
    const slug = index ? `${base}-${index + 1}` : base;
    let query = client.from(table).select("id").eq("slug", slug);
    if (id) query = query.neq("id", id);
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    if (!data) return slug;
  }
  throw new Error("Não foi possível gerar um slug único.");
}

export const getAdminData = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  await assertAdmin(context.supabase, context.userId);
  const [products, categories] = await Promise.all([
    context.supabase.from("products").select("*").order("created_at", { ascending: false }),
    context.supabase.from("categories").select("*").order("sort_order"),
  ]);
  if (products.error) throw products.error;
  if (categories.error) throw categories.error;
  return { products: products.data, categories: categories.data };
});

export const saveAdminCategory = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d: unknown) => categoryInput.parse(d)).handler(async ({ data, context }) => {
  await assertAdmin(context.supabase, context.userId);
  const slug = data.slug ?? await uniqueSlug(context.supabase, "categories", data.name, data.id);
  const values = { name: data.name, slug, description: data.description || null, active: data.active };
  const result = data.id ? await context.supabase.from("categories").update(values).eq("id", data.id).select().single() : await context.supabase.from("categories").insert(values).select().single();
  if (result.error) throw result.error;
  return result.data;
});
export const deleteAdminCategory = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d: unknown) => z.object({ id: uuid }).parse(d)).handler(async ({ data, context }) => {
  await assertAdmin(context.supabase, context.userId);
  const { error } = await context.supabase.from("categories").delete().eq("id", data.id);
  if (error) throw error;
  return true;
});
export const saveAdminProduct = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d: unknown) => productInput.parse(d)).handler(async ({ data, context }) => {
  await assertAdmin(context.supabase, context.userId);
  const slug = data.slug ?? await uniqueSlug(context.supabase, "products", data.name, data.id);
  const values = { name: data.name, slug, category_id: data.category_id, main_image: data.main_image, promo_price: data.promo_price, affiliate_url: data.affiliate_url, description: data.description || null, store: data.store || "Outra", original_price: data.original_price ?? null, active: data.active, featured: data.featured };
  const result = data.id ? await context.supabase.from("products").update(values).eq("id", data.id).select().single() : await context.supabase.from("products").insert(values).select().single();
  if (result.error) throw result.error;
  return result.data;
});
export const deleteAdminProduct = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d: unknown) => z.object({ id: uuid }).parse(d)).handler(async ({ data, context }) => {
  await assertAdmin(context.supabase, context.userId);
  const { error } = await context.supabase.from("products").delete().eq("id", data.id);
  if (error) throw error;
  return true;
});

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
