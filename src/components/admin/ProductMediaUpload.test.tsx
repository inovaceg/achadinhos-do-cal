import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { describe, expect, it, vi } from "vitest";
import { ProductMediaUpload } from "./ProductMediaUpload";
import { productFormSchema, type ProductForm } from "@/lib/admin.schemas";

vi.mock("@/lib/media", () => ({ uploadMedia: vi.fn(async (file: File) => `https://example.com/${file.name}`) }));

function MediaForm() {
  const form = useForm<ProductForm>({
    resolver: zodResolver(productFormSchema),
    defaultValues: { name: "", category_id: "", main_image: "", images: [], videos: [], promo_price: 0, affiliate_url: "", active: true, featured: false },
  });
  return <form onSubmit={form.handleSubmit(() => {})}>
    <ProductMediaUpload form={form} disabled={false} onUploading={() => {}} />
    <button type="submit">Salvar produto</button>
  </form>;
}

describe("ProductMediaUpload validation feedback", () => {
  it("accepts a video before the required photo is provided, reports on submit, then clears the error after photo upload", async () => {
    render(<MediaForm />);
    const input = screen.getByLabelText("Adicionar fotos ou vídeos");
    fireEvent.change(input, { target: { files: [new File(["video"], "clip.mp4", { type: "video/mp4" })] } });

    expect(await screen.findByText("Adicione uma foto principal para salvar o produto.")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByText(/String must contain at least 1 character/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Salvar produto" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Adicione uma foto principal para salvar o produto.");

    fireEvent.change(input, { target: { files: [new File(["image"], "photo.jpg", { type: "image/jpeg" })] } });
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
    expect(screen.getByRole("img", { name: "Prévia foto principal" })).toBeInTheDocument();
  });
});
