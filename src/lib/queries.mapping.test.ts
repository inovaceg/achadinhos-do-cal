import { describe, expect, it } from "vitest";
import { mapBanner, mapCategory, mapProduct } from "./queries";
import type { Tables } from "@/integrations/supabase/types";

describe("database row mappings", () => {
  it("normalizes nullable category values", () => {
    const category =  { id: "c1", name: "Casa", slug: "casa", icon: null, description: null, active: null, sort_order: null } as unknown as Tables<"categories">;
    expect(mapCategory(category)).toMatchObject({ icon: "", description: "", active: false, sort_order: 0 });
  });

  it("normalizes banner defaults and mobile image", () => {
    const banner =  { id: "b1", title: "Oferta", subtitle: null, image_url: "/banner.webp", mobile_image_url: null, button_text: null, button_url: null, active: null, sort_order: null, starts_at: null, ends_at: null } as unknown as Tables<"banners">;
    expect(mapBanner(banner)).toMatchObject({ subtitle: "", image_mobile: "/banner.webp", button_text: "", button_url: "", active: false, sort_order: 0 });
  });

  it("normalizes nullable product fields without changing UI aliases", () => {
    const product =  {
      id: "p1", name: "Item", slug: "item", description: null, features: null, category_id: null, store_id: null, original_price: null, price: 12.5, external_url: "https://example.com", image_url: null, images: null, videos: [], tags: null, active: null, featured: null, bestseller: null, recommended: null, created_at: null, price_updated_at: null, expires_at: null, categories: null, stores: null,
    } as unknown as Parameters<typeof mapProduct>[0];
    expect(mapProduct(product)).toMatchObject({ description: "", features: [], images: [], tags: [], active: false, promo_price: 12.5, affiliate_url: "https://example.com", main_image: null, best_seller: false });
  });
});
