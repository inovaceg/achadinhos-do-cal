import { useEffect, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { ProductForm } from "@/lib/admin.schemas";
import { uploadMedia } from "@/lib/media";

const photos = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const videos = ["video/mp4", "video/webm"];
export function ProductMediaUpload({ form, disabled, onUploading }: { form: UseFormReturn<ProductForm>; disabled: boolean; onUploading: (value: boolean) => void }) {
  const [message, setMessage] = useState("");
  const token = useRef(0);
  const mounted = useRef(false);
  const primary = form.watch("main_image");
  const images = form.watch("images") ?? [];
  const clips = form.watch("videos") ?? [];
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; token.current += 1; };
  }, []);
  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    setMessage("");
    const current = ++token.current;
    let photoSlots = 10 - (form.getValues("main_image") ? 1 : 0) - (form.getValues("images") ?? []).length;
    let videoSlots = 5 - (form.getValues("videos") ?? []).length;
    let rejected = false;
    let failed = false;
    onUploading(true);
    try {
      for (const file of files) {
        if (!mounted.current || token.current !== current) return;
        const isPhoto = photos.includes(file.type) && file.size <= 5 * 1024 * 1024;
        const isVideo = videos.includes(file.type) && file.size <= 50 * 1024 * 1024;
        if (!isPhoto && !isVideo) { rejected = true; continue; }
        if (isPhoto ? photoSlots <= 0 : videoSlots <= 0) { rejected = true; continue; }
        try {
          const url = await uploadMedia(file);
          if (!mounted.current || token.current !== current) return;
          if (isPhoto) {
            photoSlots -= 1;
            if (!form.getValues("main_image")) form.setValue("main_image", url, { shouldDirty: true, shouldValidate: true });
            else form.setValue("images", [...(form.getValues("images") ?? []), url], { shouldDirty: true, shouldValidate: true });
          } else {
            videoSlots -= 1;
            form.setValue("videos", [...(form.getValues("videos") ?? []), url], { shouldDirty: true });
          }
        } catch { failed = true; }
      }
    } finally {
      if (mounted.current && token.current === current) {
        if (rejected || failed) setMessage([rejected && "Alguns arquivos foram ignorados por formato, tamanho ou limite de mídia.", failed && "Alguns arquivos falharam no envio. Você pode tentar novamente."].filter(Boolean).join(" "));
        onUploading(false);
      }
    }
  }
  function remove(kind: "primary" | "image" | "video", index?: number) {
    if (disabled) return;
    if (kind === "primary") {
      const next = [...images];
      form.setValue("main_image", next.shift() ?? "", { shouldDirty: true, shouldValidate: true });
      form.setValue("images", next, { shouldDirty: true, shouldValidate: true });
    } else if (kind === "image") form.setValue("images", images.filter((_, i) => i !== index), { shouldDirty: true, shouldValidate: true });
    else form.setValue("videos", clips.filter((_, i) => i !== index), { shouldDirty: true, shouldValidate: true });
  }
  function makePrimary(index: number) {
    if (disabled) return;
    const next = [...images];
    const selected = next.splice(index, 1)[0];
    if (!selected || !primary) return;
    next.unshift(primary);
    form.setValue("main_image", selected, { shouldDirty: true, shouldValidate: true });
    form.setValue("images", next, { shouldDirty: true, shouldValidate: true });
  }
  return <div className="space-y-2">
    <label className="block text-sm font-medium">Fotos e vídeos (1 foto principal, até 9 extras e 5 vídeos)
      <input aria-label="Adicionar fotos ou vídeos" type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm" disabled={disabled} onChange={upload} className="mt-1 block w-full rounded-md border bg-background text-sm file:mr-3 file:border-0 file:bg-primary file:px-4 file:py-2 file:text-primary-foreground disabled:opacity-50" />
    </label>
    <p className="text-xs text-muted-foreground">Selecione vários arquivos de uma vez. Fotos JPEG, PNG, WebP ou AVIF até 5 MB; vídeos MP4 ou WebM até 50 MB. É necessário manter pelo menos uma foto.</p>
    <div className="flex flex-wrap gap-3">
      {primary && <MediaTile url={primary} video={false} label="foto principal" disabled={disabled} onRemove={() => remove("primary")} />}
      {images.map((url, i) => <MediaTile key={`${url}-${i}`} url={url} video={false} label={`foto ${i + 2}`} disabled={disabled} onRemove={() => remove("image", i)} onPrimary={() => makePrimary(i)} />)}
      {clips.map((url, i) => <MediaTile key={`${url}-${i}`} url={url} video disabled={disabled} label={`vídeo ${i + 1}`} onRemove={() => remove("video", i)} />)}
    </div>
    {message && <p role="status" className="text-sm text-destructive">{message}</p>}
    {!primary && clips.length > 0 && <p className="text-sm text-muted-foreground">Adicione uma foto principal para salvar o produto.</p>}
    {form.formState.submitCount > 0 && form.formState.errors.main_image?.message && <p role="alert" className="text-sm text-destructive">{form.formState.errors.main_image.message}</p>}
    {form.formState.errors.images?.message && <p role="alert" className="text-sm text-destructive">{form.formState.errors.images.message}</p>}
    {form.formState.errors.videos?.message && <p role="alert" className="text-sm text-destructive">{form.formState.errors.videos.message}</p>}
  </div>;
}
function MediaTile({ url, video, label, disabled, onRemove, onPrimary }: { url: string; video: boolean; label: string; disabled: boolean; onRemove: () => void; onPrimary?: () => void }) {
  return (
    <div className="w-36 overflow-hidden rounded-lg border bg-muted">
      <div className="h-32">
        {video ? <video src={url} controls playsInline preload="metadata" aria-label={`Prévia ${label}`} className="h-full w-full object-contain" /> : <img src={url} alt={`Prévia ${label}`} className="h-full w-full object-contain" />}
      </div>
      <div className="space-y-1.5 border-t bg-card p-2">
        <p className="text-xs font-medium capitalize">{label}</p>
        {onPrimary && <button type="button" disabled={disabled} aria-label={`Usar ${label} como principal`} onClick={onPrimary} className="w-full rounded bg-primary px-2 py-1.5 text-xs text-primary-foreground disabled:opacity-50">Usar como principal</button>}
        <button type="button" disabled={disabled} aria-label={`Remover ${label}`} onClick={onRemove} className="w-full rounded border px-2 py-1.5 text-xs disabled:opacity-50">Remover</button>
      </div>
    </div>
  );
}
