import { useEffect, useState } from "react";

type Media = { url: string; video: boolean };
export function ProductMediaGallery({ productId, name, primary, images, videos }: { productId: string; name: string; primary: string | null; images: string[]; videos: string[] }) {
  const media: Media[] = [...new Set([primary, ...images].filter((url): url is string => !!url))].map(url => ({ url, video: false })).concat(videos.map(url => ({ url, video: true })));
  const [selected, setSelected] = useState(0);
  useEffect(() => setSelected(0), [productId]);
  const active = media[selected];
  return <div className="space-y-3">
    <div key={active?.url ?? "empty"} className="aspect-square overflow-hidden rounded-3xl border border-border bg-card">
      {active?.video ? <video src={active.url} controls playsInline preload="metadata" className="h-full w-full object-contain" /> : active && <img src={active.url} alt={name} className="h-full w-full object-contain" />}
    </div>
    {media.length > 1 && <div className="flex gap-2 overflow-x-auto">{media.map((item, index) => <button type="button" key={`${item.url}-${index}`} aria-label={`${item.video ? "Vídeo" : "Foto"} ${index + 1} de ${media.length}`} aria-pressed={selected === index} onClick={() => setSelected(index)} className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-card ${selected === index ? "border-primary" : "border-border"}`}>{item.video ? <span className="flex h-full items-center justify-center text-xs">▶ Vídeo</span> : <img src={item.url} alt="" loading="lazy" className="h-full w-full object-contain" />}</button>)}</div>}
  </div>;
}
