import { describe, expect, it } from "vitest";
import { productFormSchema, categoryFormSchema, productInput } from "./admin.schemas";

describe("admin schemas", () => {
  const valid = { name: "Oferta", category_id: "550e8400-e29b-41d4-a716-446655440000", main_image: "/media/products/foto.webp", promo_price: 25.5, affiliate_url: "https://loja.example/oferta", active: true, featured: false };
  it.each([19.99, 0.29])("accepts valid price %s", (promo_price) => {
    expect(productFormSchema.parse({ ...valid, promo_price }).promo_price).toBe(promo_price);
  });
  it.each(["", "not-a-url"])("rejects blank or plain affiliate URL without throwing (%s)", (affiliate_url) => {
    expect(productFormSchema.safeParse({ ...valid, affiliate_url }).success).toBe(false);
  });
  it.each(["javascript:alert(1)", "//example.com/path", "data:image/png;base64,AA=="])("rejects unsafe images and purchase links (%s)", (value) => {
    expect(() => productFormSchema.parse({ ...valid, main_image: value })).toThrow();
    expect(() => productFormSchema.parse({ ...valid, affiliate_url: value })).toThrow();
  });
  it.each([0, -1, 10000000000, 12.345])("rejects invalid prices %s", (promo_price) => {
    expect(() => productFormSchema.parse({ ...valid, promo_price })).toThrow();
  });
  it("requires a category UUID at the form and server boundary", () => {
    expect(() => productFormSchema.parse({ ...valid, category_id: "" })).toThrow();
    expect(() => productInput.parse({ ...valid, category_id: null })).toThrow();
  });
  it("validates category form fields", () => {
    expect(categoryFormSchema.parse({ name: "Casa", active: true })).toMatchObject({ name: "Casa" });
  });
});
