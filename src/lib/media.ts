import { supabase } from "@/integrations/supabase/client";

/** Uploads an image to the media bucket and returns a same-origin URL served by /media/*. */
export async function uploadImage(file: File, folder: string) {
  if (!file.type.startsWith("image/")) throw new Error("Envie apenas imagens.");
  if (file.size > 5 * 1024 * 1024) throw new Error("A imagem deve ter no máximo 5MB.");
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
  });
  if (error) throw error;
  return `/media/${path}`;
}

/** Makes a stored image URL absolute (needed for social share tags). */
export function absoluteUrl(url: string | null | undefined, origin: string) {
  if (!url) return undefined;
  if (/^https?:\/\//.test(url)) return url;
  return origin.replace(/\/$/, "") + (url.startsWith("/") ? url : `/${url}`);
}
