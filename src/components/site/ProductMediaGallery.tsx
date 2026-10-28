import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { ProductVideo } from "./ProductVideo";
import { VideoThumbnail } from "./VideoThumbnail";

type Media = { url: string; video: boolean };
export function ProductMediaGallery({ productId, name, primary, images, videos }: { productId: string; name: string; primary: string | null; images: string[]; videos: string[] }) {
  const media: Media[] = [...new Set([primary, ...images].filter((url): url is string => !!url))].map(url => ({ url, video: false })).concat([...new Set(videos)].map(url => ({ url, video: true })));
  const [selected, setSelected] = useState(0);
  useEffect(() => setSelected(0), [productId]);
  const active = media[selected];
  const selectMedia = (index: number) => {
    if (media[index]?.video) flushSync(() => setSelected(index));
    else setSelected(index);
  };
  const move = (direction: number) => selectMedia((selected + direction + media.length) % media.length);
  return <div className="space-y-3">
    <div className="relative aspect-square overflow-hidden rounded-3xl border border-border bg-card">
      {active?.video ? <ProductVideo key={active.url} src={active.url} poster={primary} label={`Vídeo de ${name}`} /> : active && <img src={active.url} alt={name} className="h-full w-full object-contain" />}
      {media.length > 1 && <><button type="button" aria-label="Mídia anterior" onClick={() => move(-1)} className="absolute left-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-card/90 shadow-card"><ChevronLeft /></button><button type="button" aria-label="Próxima mídia" onClick={() => move(1)} className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-card/90 shadow-card"><ChevronRight /></button><span aria-live="polite" className={`absolute left-1/2 -translate-x-1/2 rounded-full bg-card/90 px-3 py-1 text-xs ${active?.video ? "top-14" : "bottom-2"}`}>{selected + 1} / {media.length}{media.some(item => item.video) ? " · Vídeo disponível" : ""}</span></>}
    </div>
    {media.length > 1 && <div className="flex gap-2 overflow-x-auto">{media.map((item, index) => <button type="button" key={`${item.url}-${index}`} aria-label={`${item.video ? "Vídeo" : "Foto"} ${index + 1} de ${media.length}`} aria-pressed={selected === index} onClick={() => selectMedia(index)} className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-card ${selected === index ? "border-primary" : "border-border"}`}>{item.video ? <VideoThumbnail src={item.url} poster={primary} /> : <img src={item.url} alt="" loading="lazy" className="h-full w-full object-contain" />}</button>)}</div>}
  </div>;
}
