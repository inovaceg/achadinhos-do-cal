import { describe, expect, it } from "vitest";
import { collectionSchema, contactsSchema, httpUrlSchema, promoSchema } from "@/lib/site-content.schemas";

const id = "6e3e2c8b-8f40-4ee0-9b53-7d9d7f1a2c30";
describe("site content schemas", () => {
  it("rejects malformed and non-http URLs without throwing", () => {
    expect(httpUrlSchema.safeParse("not a url").success).toBe(false);
    expect(httpUrlSchema.safeParse("javascript:alert(1)").success).toBe(false);
  });
  it("requires exactly one promo destination", () => {
    const base = { title: "Oferta", image_url: "https://example.com/image.webp", active: true, sort_order: 0 };
    expect(promoSchema.safeParse({ ...base, category_id: id, collection_id: id }).success).toBe(false);
    expect(promoSchema.safeParse({ ...base, category_id: null, collection_id: null }).success).toBe(false);
  });
  it("requires a real associated product and rejects unsafe social hosts", () => {
    const base = { title: "Vídeos", cover_url: "https://example.com/cover.webp", video_url: "https://youtube.com/watch?v=x", active: true, sort_order: 0 };
    expect(collectionSchema.safeParse({ ...base, product_ids: [] }).success).toBe(false);
    expect(contactsSchema.safeParse({ instagram: "https://instagram.com.attacker.test/x", tiktok: "", whatsapp: "12345678", contact_email: "" }).success).toBe(false);
    expect(contactsSchema.parse({ instagram: "@achadinhos", tiktok: "", whatsapp: "12345678", contact_email: "" }).instagram).toBe("https://instagram.com/achadinhos");
  });
});
