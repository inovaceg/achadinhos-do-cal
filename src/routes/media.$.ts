import { createFileRoute } from "@tanstack/react-router";
import { publicClient } from "@/lib/public.server";

export const Route = createFileRoute("/media/$")({
  server: { handlers: { GET: async ({ params }) => {
    const path = params._splat ?? "";
    if (!/^[a-z0-9_-]+\/[a-z0-9-]+\.[a-z0-9]+$/i.test(path)) return new Response("Not found", { status: 404 });
    const { data, error } = await publicClient().storage.from("site-images").download(path);
    if (error || !data) return new Response("Not found", { status: 404 });
    return new Response(data, { headers: { "content-type": data.type || "image/jpeg", "cache-control": "public, max-age=31536000, immutable" } });
  } } },
});
