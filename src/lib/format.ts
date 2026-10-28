export function formatBRL(value: number | null | undefined) {
  if (value == null || Number.isNaN(Number(value))) return "";
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Desconto (%) = ((original - promo) / original) * 100, only when values are valid and original > promo. */
export function calcDiscount(original: number | null | undefined, promo: number | null | undefined): number | null {
  const o = Number(original);
  const p = Number(promo);
  if (original == null || promo == null || !Number.isFinite(o) || !Number.isFinite(p)) return null;
  if (o <= 0 || p < 0 || o <= p) return null;
  return Math.round(((o - p) / o) * 100);
}

export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function isValidHttpUrl(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}
