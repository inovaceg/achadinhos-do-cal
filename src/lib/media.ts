import { supabase } from "@/integrations/supabase/client";

export async function uploadImage(file: File, folder: string) {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  if (!allowed.includes(file.type)) throw new Error("Envie uma imagem JPEG, PNG, WebP ou AVIF.");
  if (file.size > 5 * 1024 * 1024) throw new Error("A imagem deve ter no máximo 5MB.");
  const ext = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("site-images").upload(path, file, { contentType: file.type, cacheControl: "31536000" });
  if (error) throw error;
  return supabase.storage.from("site-images").getPublicUrl(path).data.publicUrl;
}

export function absoluteUrl(url: string | null | undefined, origin: string) {
  if (!url) return undefined;
  if (/^https?:\/\//.test(url)) return url;
  return origin.replace(/\/$/, "") + (url.startsWith("/") ? url : `/${url}`);
}
