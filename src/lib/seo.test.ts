import { describe, expect, it } from "vitest";
import { DEFAULT_OG_IMAGE, SITE_ORIGIN, seoImageUrl, siteUrl } from "./seo";

describe("SEO URLs", () => {
  it("uses the verified production origin and preserves same-origin paths", () => {
    expect(SITE_ORIGIN).toBe("https://achadinhos-do-cal.vercel.app");
    expect(siteUrl("/")).toBe(`${SITE_ORIGIN}/`);
    expect(siteUrl("/produto/a%20b")).toBe(`${SITE_ORIGIN}/produto/a%20b`);
    expect(new URL(DEFAULT_OG_IMAGE).origin).toBe(SITE_ORIGIN);
  });

  it("rejects external or protocol-relative paths", () => {
    expect(() => siteUrl("//evil.example/path")).toThrow();
    expect(() => siteUrl("\\\\evil.example\\path")).toThrow();
  });

  it("maps only local assets and valid product storage assets", () => {
    expect(seoImageUrl("/assets/logo.png")).toBe(`${SITE_ORIGIN}/assets/logo.png`);
    expect(seoImageUrl("//evil.example/image.png")).toBeUndefined();
    expect(seoImageUrl("\\\\evil.example\\image.png")).toBeUndefined();
    expect(seoImageUrl("https://qtrppoeefvzyhwywmcjb.supabase.co/storage/v1/object/public/site-images/products/abc.webp"))
      .toBe(`${SITE_ORIGIN}/seo/imagem?arquivo=products%2Fabc.webp`);
    expect(seoImageUrl("https://example.com/products/a.jpg")).toBeUndefined();
    expect(seoImageUrl("https://qtrppoeefvzyhwywmcjb.supabase.co/storage/v1/object/public/site-images/products/../secret.jpg")).toBeUndefined();
    expect(seoImageUrl("https://qtrppoeefvzyhwywmcjb.supabase.co/storage/v1/object/public/site-images/products/a%2f..%2fsecret.jpg")).toBeUndefined();
    expect(seoImageUrl("https://qtrppoeefvzyhwywmcjb.supabase.co/storage/v1/object/public/site-images/products/a.svg")).toBeUndefined();
  });
});
