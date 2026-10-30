export const SITEMAP_PAGE_SIZE = 500;

export async function fetchAllPages<T>(fetchPage: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += SITEMAP_PAGE_SIZE) {
    const { data, error } = await fetchPage(from, from + SITEMAP_PAGE_SIZE - 1);
    if (error) throw error;
    const page = data ?? [];
    rows.push(...page);
    if (page.length < SITEMAP_PAGE_SIZE) return rows;
  }
}

export function validIsoDate(value: string | null | undefined): string | null {
  if (!value || !Number.isFinite(Date.parse(value))) return null;
  return new Date(value).toISOString();
}

export function xmlEscape(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]!);
}

export function buildSitemap(origin: string, entries: { path: string; lastmod?: string | null }[]): string {
  const unique = new Map<string, string | null>();
  for (const entry of entries) {
    const url = new URL(entry.path, origin).href;
    unique.set(url, entry.lastmod ?? unique.get(url) ?? null);
  }
  const urls = [...unique].map(([url, lastmod]) => `<url><loc>${xmlEscape(url)}</loc>${lastmod ? `<lastmod>${xmlEscape(lastmod)}</lastmod>` : ""}</url>`);
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`;
}
