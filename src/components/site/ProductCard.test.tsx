import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/lib/queries";

vi.mock("@tanstack/react-router", () => ({ Link: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <a href="/product" {...props}>{children}</a> }));
vi.mock("@/lib/visitor", () => ({ trackClick: vi.fn(), useFavorites: () => ({ isFav: () => false, toggle: vi.fn() }) }));
const product = { id: "p1", slug: "item", name: "Item", main_image: "photo.jpg", images: [], videos: [], original_price: null, promo_price: 10, best_seller: false, recommended: false, badge: null, store: null, affiliate_url: "https://shop.example/item" } as unknown as Product;
beforeEach(() => vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined));

describe("ProductCard media navigation", () => {
  it("moves from a photo to a video without activating the product or affiliate link", () => {
    render(<ProductCard product={{ ...product, videos: ["clip.mp4"] }} />);
    fireEvent.click(screen.getByRole("button", { name: "Próxima mídia" }));
    expect(screen.getByLabelText("Vídeo de Item")).toBeInTheDocument();
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledOnce();
    expect(screen.getByText("2 / 2 · Vídeo disponível")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /VER OFERTA/ })).toHaveAttribute("href", "https://shop.example/item");
    expect(screen.getByRole("link", { name: "Item" })).toHaveAttribute("href", "/product");
  });

  it("does not render arrows for a single media item", () => {
    render(<ProductCard product={product} />);
    expect(screen.queryByRole("button", { name: "Próxima mídia" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Mídia anterior" })).not.toBeInTheDocument();
  });
});
