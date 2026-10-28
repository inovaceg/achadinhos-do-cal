import { z } from "zod";

const uuid = z.string().uuid();
const safeText = (max: number) => z.string().trim().max(max);
const slugSchema = z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const imageSchema = z.string().trim().min(1, "Adicione uma foto principal para salvar o produto.").max(2000).refine((value) => {
  if (value.startsWith("/")) return value.startsWith("/media/") && !value.startsWith("//");
  try { const url = new URL(value); return url.protocol === "http:" || url.protocol === "https:"; } catch { return false; }
}, "Use uma imagem HTTP(S) ou um caminho /media/.");
const externalUrl = z.string().trim().url().max(2000).refine((value) => {
  try {
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}, "Use um link HTTP ou HTTPS.");
const price = z.coerce.number().finite().positive().max(9999999999.99).refine((value) => Math.abs(value * 100 - Math.round(value * 100)) <= Number.EPSILON * Math.max(1, Math.abs(value * 100)), "Informe no máximo duas casas decimais.");
export const categoryInput = z.object({ id: uuid.optional(), name: safeText(120).min(1), slug: slugSchema.optional(), description: safeText(2000).optional(), active: z.boolean() });
export const videoSchema = externalUrl;
const productBase = z.object({
  id: uuid.optional(), name: safeText(200).min(1), slug: slugSchema.optional(), category_id: uuid,
  main_image: imageSchema, images: z.array(imageSchema).max(9).default([]), videos: z.array(videoSchema).max(5).default([]),
  promo_price: price, affiliate_url: externalUrl, description: safeText(10000).optional(),
  store: safeText(120).optional(), original_price: price.nullable().optional(), active: z.boolean(), featured: z.boolean(),
});
const refineProduct = (data: z.infer<typeof productBase>, ctx: z.RefinementCtx) => {
  if (data.images.includes(data.main_image)) ctx.addIssue({ code: "custom", path: ["images"], message: "A foto principal não pode estar repetida." });
  if (data.videos.some(url => data.images.includes(url) || url === data.main_image)) ctx.addIssue({ code: "custom", path: ["videos"], message: "Uma mídia não pode estar repetida." });
  if (new Set(data.images).size !== data.images.length || new Set(data.videos).size !== data.videos.length) ctx.addIssue({ code: "custom", path: ["images"], message: "Remova mídias duplicadas." });
};
export const productInput = productBase.superRefine(refineProduct);
export const productFormSchema = productBase.omit({ id: true, slug: true }).superRefine(refineProduct);
export const categoryFormSchema = categoryInput.omit({ id: true, slug: true });
export type ProductForm = z.input<typeof productFormSchema>;
export type ProductFormOutput = z.output<typeof productFormSchema>;
export type CategoryForm = z.infer<typeof categoryFormSchema>;
