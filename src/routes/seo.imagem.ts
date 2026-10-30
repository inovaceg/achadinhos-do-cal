import { createFileRoute } from "@tanstack/react-router";
import { isValidSeoImagePath } from "@/lib/seo";
import { publicClient } from "@/lib/public.server";

const extensions = new Set(["jpg", "jpeg", "png", "webp", "avif"]);
const contentTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export const Route = createFileRoute("/seo/imagem")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const arquivo = new URL(request.url).searchParams.get("arquivo") ?? "";
        const extension = arquivo.split(".").at(-1)?.toLowerCase();
        if (!isValidSeoImagePath(arquivo) || !extension || !extensions.has(extension)) {
          return new Response("Invalid image path", { status: 400 });
        }
        const { data, error } = await publicClient().storage.from("site-images").download(arquivo);
        if (error || !data) return new Response("Image not found", { status: 404 });
        if (data.size > 5 * 1024 * 1024) return new Response("Image too large", { status: 415 });
        if (!contentTypes.has(data.type.toLowerCase())) return new Response("Unsupported image type", { status: 415 });
        return new Response(data, { headers: { "content-type": data.type, "cache-control": "public, max-age=3600", "x-content-type-options": "nosniff" } });
      },
    },
  },
});
