import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProductMediaGallery } from "./ProductMediaGallery";

beforeEach(() => vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined));

describe("ProductMediaGallery video thumbnail", () => {
  it("shows a visual thumbnail with a primary-image fallback and selects the playable video", () => {
    const { container } = render(<ProductMediaGallery productId="p1" name="Produto" primary="https://example.test/cover.jpg" images={[]} videos={["https://example.test/video.mp4"]} />);

    expect(screen.queryByText("▶ Vídeo")).not.toBeInTheDocument();
    expect(container.querySelector('button[aria-label="Vídeo 2 de 2"] img')).toHaveAttribute("src", "https://example.test/cover.jpg");
    const thumbnailVideo = container.querySelector<HTMLVideoElement>('button[aria-label="Vídeo 2 de 2"] video')!;
    expect(thumbnailVideo.muted).toBe(true);
    expect(thumbnailVideo).toHaveAttribute("playsinline");
    expect(thumbnailVideo).toHaveAttribute("preload", "metadata");
    expect(thumbnailVideo).not.toHaveAttribute("autoplay");
    expect(thumbnailVideo).not.toHaveAttribute("controls");
    expect(thumbnailVideo).toHaveAttribute("aria-hidden", "true");

    fireEvent.click(screen.getByRole("button", { name: "Vídeo 2 de 2" }));
    const player = container.querySelector('.aspect-square video')!;
    expect(player).toHaveAttribute("autoplay");
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledOnce();
    expect(player).toHaveAttribute("controls");
    expect(player).toHaveAttribute("src", "https://example.test/video.mp4");
    expect(screen.getByRole("button", { name: "Vídeo 2 de 2" })).toHaveAttribute("aria-pressed", "true");
  });

  it("renders the play overlay on a neutral background without a primary image", () => {
    const { container } = render(<ProductMediaGallery productId="p2" name="Produto" primary={null} images={["https://example.test/other.jpg"]} videos={["https://example.test/video.mp4"]} />);
    const thumbnail = container.querySelector('button[aria-label="Vídeo 2 de 2"]');
    expect(thumbnail).toBeInTheDocument();
    expect(thumbnail).toHaveTextContent("");
    expect(thumbnail?.querySelector("svg")).toBeInTheDocument();
  });
});
