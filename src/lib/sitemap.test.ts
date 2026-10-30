import { describe, expect, it } from "vitest";
import { buildSitemap, fetchAllPages, SITEMAP_PAGE_SIZE, validIsoDate, xmlEscape } from "@/lib/sitemap";

describe("sitemap helpers", () => {
  it("escapes XML metacharacters", () => {
    expect(xmlEscape(`<&>\"'`)).toBe("&lt;&amp;&gt;&quot;&apos;");
  });

  it("accepts valid dates and omits missing or invalid dates", () => {
    expect(validIsoDate("2024-01-02T03:04:05Z")).toBe("2024-01-02T03:04:05.000Z");
    expect(validIsoDate(null)).toBeNull();
    expect(validIsoDate("not-a-date")).toBeNull();
  });

  it("encodes routes, escapes XML, and deduplicates URLs", () => {
    const xml = buildSitemap("https://example.test", [
      { path: "/produto/a&b" },
      { path: "/produto/a&b", lastmod: "2024-01-02T03:04:05.000Z" },
    ]);
    expect(xml).toContain("https://example.test/produto/a&amp;b");
    expect(xml.match(/<url>/g)).toHaveLength(1);
    expect(xml).toContain("<lastmod>2024-01-02T03:04:05.000Z</lastmod>");
  });

  it("fetches all pages until a short page", async () => {
    const rows = Array.from({ length: SITEMAP_PAGE_SIZE + 2 }, (_, id) => id);
    const ranges: [number, number][] = [];
    const result = await fetchAllPages(async (from, to) => {
      ranges.push([from, to]);
      return { data: rows.slice(from, to + 1), error: null };
    });
    expect(result).toEqual(rows);
    expect(ranges).toEqual([[0, 499], [500, 999]]);
  });
});
