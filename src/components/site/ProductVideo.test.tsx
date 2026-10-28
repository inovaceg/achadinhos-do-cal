import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProductVideo } from "./ProductVideo";

describe("ProductVideo errors", () => {
  it("autoplays with sound at full volume while preserving the selected video URL and player options", () => {
    const { container } = render(<ProductVideo src="https://example.test/video.mp4" poster="https://example.test/poster.jpg" label="Vídeo do produto" />);
    const video = container.querySelector("video")!;

    expect(video).toHaveAttribute("src", "https://example.test/video.mp4");
    expect(video).toHaveAttribute("poster", "https://example.test/poster.jpg");
    expect(video).toHaveAttribute("autoplay");
    expect(video.muted).toBe(false);
    expect(video.volume).toBe(1);
    expect(video).toHaveAttribute("playsinline");
    expect(video).toHaveAttribute("controls");
    expect(video).toHaveAttribute("preload", "metadata");
  });

  it("shows a Portuguese error and retries by loading the player", () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const { container } = render(<ProductVideo src="https://example.test/video.mp4" poster="https://example.test/poster.jpg" label="Vídeo do produto" />);
    const video = container.querySelector("video")!;
    const load = vi.spyOn(video, "load").mockImplementation(() => {});
    Object.defineProperty(video, "error", { configurable: true, value: { code: 3 } });
    fireEvent.error(video);
    expect(screen.getByRole("alert")).toHaveTextContent("Não foi possível reproduzir o vídeo");
    expect(log).toHaveBeenCalledWith("Falha ao reproduzir vídeo", { src: "https://example.test/video.mp4", code: 3 });
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(load).toHaveBeenCalledOnce();
    log.mockRestore();
  });
});
