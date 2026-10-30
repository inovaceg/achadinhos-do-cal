export const SITE_ORIGIN = "https://achadinhos-do-cal.vercel.app";

export function siteUrl(path: string): string {
  if (path.includes("\\")) throw new Error("SEO URL path must not contain backslashes");
  const url = new URL(path, SITE_ORIGIN);
  if (url.origin !== SITE_ORIGIN) throw new Error("SEO URL must use the official site origin");
  return url.href;
}

const PRODUCT_IMAGE_PREFIX = "https://qtrppoeefvzyhwywmcjb.supabase.co/storage/v1/object/public/site-images/";
const allowedImageExtensions = new Set(["jpg", "jpeg", "png", "webp", "avif"]);

export function isValidSeoImagePath(path: string): boolean {
  if (path.length > 2000 || !/^[a-zA-Z0-9._/-]+$/.test(path)) return false;
  const parts = path.split("/");
  return path.startsWith("products/") && parts.every((part) => part && part !== "." && part !== "..");
}

export function seoImageUrl(original: string | null | undefined): string | undefined {
  if (!original) return undefined;
  if (original.startsWith("/")) {
    try {
      return siteUrl(original);
    } catch {
      return undefined;
    }
  }
  if (!original.startsWith(PRODUCT_IMAGE_PREFIX)) return undefined;
  const path = original.slice(PRODUCT_IMAGE_PREFIX.length);
  if (!isValidSeoImagePath(path)) return undefined;
  const extension = path.split(".").at(-1)?.toLowerCase();
  if (!extension || !allowedImageExtensions.has(extension)) return undefined;
  return siteUrl(`/seo/imagem?arquivo=${encodeURIComponent(path)}`);
}

export const DEFAULT_OG_IMAGE = siteUrl("/assets/achadinhos-do-cal-3d-transparent.png");
