import { supabase } from "@/integrations/supabase/client";

const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const videoTypes = ["video/mp4", "video/webm"];
export async function uploadMedia(file: File) {
  const isImage = imageTypes.includes(file.type);
  const isVideo = videoTypes.includes(file.type);
  if (!isImage && !isVideo) throw new Error("Formato de mídia não aceito.");
  if (file.size > (isImage ? 5 : 50) * 1024 * 1024) throw new Error("O arquivo excede o limite permitido.");
  const extension = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
  const bucket = isImage ? "site-images" : "site-videos";
  const path = `products/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type, cacheControl: "31536000" });
  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export function absoluteUrl(url: string | null | undefined, origin: string) {
  if (!url) return undefined;
  if (/^https?:\/\//.test(url)) return url;
  return origin.replace(/\/$/, "") + (url.startsWith("/") ? url : `/${url}`);
}
