import { describe, expect, it } from "vitest";
import { calcDiscount, isValidHttpUrl, slugify } from "./format";

describe("calcDiscount", () => {
  it("computes 46% for 129.90 -> 69.90", () => {
    expect(calcDiscount(129.9, 69.9)).toBe(46);
  });
  it("returns null when original is not greater than promo", () => {
    expect(calcDiscount(50, 50)).toBeNull();
    expect(calcDiscount(40, 50)).toBeNull();
  });
  it("returns null when a price is missing", () => {
    expect(calcDiscount(null, 50)).toBeNull();
    expect(calcDiscount(100, null)).toBeNull();
  });
});

describe("helpers", () => {
  it("slugifies product names", () => {
    expect(slugify("Fone Bluetooth Sem Fio")).toBe("fone-bluetooth-sem-fio");
  });
  it("rejects non-http links", () => {
    expect(isValidHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isValidHttpUrl("https://shopee.com.br/x")).toBe(true);
  });
});
