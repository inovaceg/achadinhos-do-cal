import { describe, expect, it } from "vitest";
import { productFormSchema } from "./admin.schemas";
const valid = { name: "Produto", category_id: "00000000-0000-4000-8000-000000000001", main_image: "https://example.com/main.jpg", images: [], videos: [], promo_price: 10, affiliate_url: "https://example.com", active: true, featured: false };
describe("product media validation", () => {
  it("accepts up to nine extra photos and five HTTP(S) video URLs", () => {
    expect(productFormSchema.safeParse({ ...valid, images: Array.from({ length: 9 }, (_, i) => `https://example.com/${i}.jpg`), videos: Array.from({ length: 5 }, (_, i) => `https://example.com/${i}.mp4`) }).success).toBe(true);
  });
  it("requires a primary photo with a Portuguese validation message", () => {
    const result = productFormSchema.safeParse({ ...valid, main_image: "" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.find(issue => issue.path[0] === "main_image")?.message).toBe("Adicione uma foto principal para salvar o produto.");
  });
  it("rejects excess media, unsafe URLs, and duplicates across media kinds", () => {
    expect(productFormSchema.safeParse({ ...valid, images: Array.from({ length: 10 }, (_, i) => `https://example.com/${i}.jpg`) }).success).toBe(false);
    expect(productFormSchema.safeParse({ ...valid, videos: Array.from({ length: 6 }, (_, i) => `https://example.com/${i}.mp4`) }).success).toBe(false);
    expect(productFormSchema.safeParse({ ...valid, videos: ["javascript:alert(1)"] }).success).toBe(false);
    expect(productFormSchema.safeParse({ ...valid, images: [valid.main_image] }).success).toBe(false);
    expect(productFormSchema.safeParse({ ...valid, videos: [valid.main_image] }).success).toBe(false);
    expect(productFormSchema.safeParse({ ...valid, images: ["https://example.com/same.jpg", "https://example.com/same.jpg"] }).success).toBe(false);
  });
});
