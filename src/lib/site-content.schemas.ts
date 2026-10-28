import { z } from "zod";

export const uuidSchema = z.string().uuid();
export const httpUrlSchema = z.string().trim().url().max(2000).refine((value) => {
  try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; }
}, "Informe uma URL HTTP ou HTTPS válida.");
export const collectionSchema = z.object({
  id: uuidSchema.optional(), title: z.string().trim().min(1).max(160), cover_url: httpUrlSchema,
  video_url: httpUrlSchema.refine((value) => {
    try {
      const host = new URL(value).hostname.toLowerCase();
      return ["instagram.com", "tiktok.com", "youtube.com", "youtu.be"].some((domain) => host === domain || host.endsWith(`.${domain}`));
    } catch { return false; }
  }, "Use um link do Instagram, TikTok ou YouTube."),
  active: z.boolean(), sort_order: z.number().int().min(0).max(100000), product_ids: z.array(uuidSchema).min(1).max(1000),
});
export const promoSchema = z.object({
  id: uuidSchema.optional(), title: z.string().trim().min(1).max(160), image_url: httpUrlSchema,
  category_id: uuidSchema.nullable(), collection_id: uuidSchema.nullable(), active: z.boolean(), sort_order: z.number().int().min(0).max(100000),
}).refine((value) => Number(!!value.category_id) + Number(!!value.collection_id) === 1, "Escolha uma categoria ou uma coleção.");
const socialUrl = (host: string) => z.string().trim().max(200).refine((value) => {
  if (!value || /^@?[a-zA-Z0-9._]+$/.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && (url.hostname === host || url.hostname.endsWith(`.${host}`));
  } catch { return false; }
}, "Informe um @perfil ou a URL HTTPS do perfil.").transform((value) => !value || value.startsWith("https://") ? value : `https://${host}/${host === "tiktok.com" ? "@" : ""}${value.replace(/^@/, "")}`);
export const contactsSchema = z.object({
  instagram: socialUrl("instagram.com"), tiktok: socialUrl("tiktok.com"),
  whatsapp: z.string().trim().max(30).refine((value) => !value || /^\+?[\d ()-]+$/.test(value) && value.replace(/\D/g, "").length >= 8 && value.replace(/\D/g, "").length <= 15, "Informe um WhatsApp com 8 a 15 dígitos."),
  contact_email: z.string().trim().max(254).email().or(z.literal("")),
});
export const imageFileSchema = z.custom<File>((file) => typeof File !== "undefined" && file instanceof File && ["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type) && file.size <= 5 * 1024 * 1024, "Use JPEG, PNG, WebP ou AVIF de até 5 MB.");
export const adminDeleteSchema = z.object({ id: uuidSchema });
