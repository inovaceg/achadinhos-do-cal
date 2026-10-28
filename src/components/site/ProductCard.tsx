import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, ExternalLink, Heart, ImageOff } from "lucide-react";
import { useState } from "react";
import { calcDiscount, formatBRL } from "@/lib/format";
import { trackClick, useFavorites } from "@/lib/visitor";
import type { Product } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { ProductVideo } from "./ProductVideo";

export function OfferButton({ product, className }: { product: Product; className?: string }) {
  return (
    <a href={product.affiliate_url} target="_blank" rel="noopener noreferrer nofollow sponsored" onClick={() => trackClick({ productId: product.id })} className={cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-glow transition hover:brightness-105 active:scale-[0.98]", className)}>
      VER OFERTA <ExternalLink className="h-4 w-4" />
    </a>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { isFav, toggle } = useFavorites();
  const discount = calcDiscount(product.original_price, product.promo_price);
  const fav = isFav(product.id);
  const badge = product.badge || (product.best_seller ? "Mais vendido" : product.recommended ? "Recomendado" : null);
  const media = [...new Set([product.main_image, ...(product.images ?? [])].filter((url): url is string => !!url))].map(url => ({ url, video: false })).concat([...new Set(product.videos ?? [])].map(url => ({ url, video: true })));
  const [selected, setSelected] = useState(0);
  const active = media[selected];
  const move = (direction: number) => setSelected(index => (index + direction + media.length) % media.length);

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-white">
        {active?.video ? <ProductVideo key={active.url} src={active.url} poster={product.main_image} label={`Vídeo de ${product.name}`} /> : <Link to="/produto/$slug" params={{ slug: product.slug }} aria-label={product.name} className="block h-full w-full">{active ? <img src={active.url} alt={product.name} loading="lazy" decoding="async" className="h-full w-full object-contain object-center p-3 sm:p-4" /> : <div className="grid h-full place-items-center text-muted-foreground"><ImageOff className="h-8 w-8" /></div>}</Link>}
        {media.length > 1 && <><button type="button" aria-label="Mídia anterior" onClick={() => move(-1)} className="absolute left-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-card/90 shadow-card"><ChevronLeft /></button><button type="button" aria-label="Próxima mídia" onClick={() => move(1)} className="absolute right-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-card/90 shadow-card"><ChevronRight /></button><span aria-live="polite" className={`absolute left-1/2 z-10 -translate-x-1/2 rounded-full bg-card/90 px-3 py-1 text-xs ${active?.video ? "top-14" : "bottom-2"}`}>{selected + 1} / {media.length}{media.some(item => item.video) ? " · Vídeo disponível" : ""}</span></>}
        <div className="absolute left-2 top-2 z-20 flex flex-col items-start gap-1">{discount != null && <span className="rounded-lg bg-success px-2 py-1 text-xs font-extrabold text-success-foreground">{discount}% OFF</span>}{badge && <span className="rounded-lg bg-secondary px-2 py-1 text-[10px] font-bold uppercase text-secondary-foreground">{badge}</span>}</div>
        <button type="button" onClick={() => toggle(product.id)} aria-label={fav ? "Remover dos favoritos" : "Adicionar aos favoritos"} aria-pressed={fav} className="absolute right-2 top-2 z-20 grid h-11 w-11 place-items-center rounded-full bg-card/90 shadow-card backdrop-blur transition hover:scale-110"><Heart className={cn("h-4 w-4", fav ? "fill-primary text-primary" : "text-foreground")} /></button>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-3">
        {product.store && <span className="truncate text-[11px] font-semibold uppercase tracking-wide text-primary">{product.store}</span>}
        <Link to="/produto/$slug" params={{ slug: product.slug }} className="line-clamp-2 min-h-[2.75rem] text-sm font-semibold leading-snug hover:text-primary">{product.name}</Link>
        <div className="mt-auto pt-1">{product.original_price != null && discount != null && <p className="text-xs text-muted-foreground line-through">De: {formatBRL(product.original_price)}</p>}{product.promo_price != null && <p className="font-display text-xl font-extrabold leading-tight md:text-2xl"><span className="text-xs font-semibold text-muted-foreground">Por: </span>{formatBRL(product.promo_price)}</p>}</div>
        <OfferButton product={product} className="mt-2 w-full py-2.5 text-xs sm:text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" />
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return <div className="grid w-full min-w-0 grid-cols-[repeat(2,minmax(0,1fr))] gap-3 md:grid-cols-[repeat(3,minmax(0,1fr))] md:gap-4 lg:grid-cols-[repeat(4,minmax(0,1fr))] xl:grid-cols-[repeat(5,minmax(0,1fr))]">{products.map(p => <ProductCard key={p.id} product={p} />)}</div>;
}

export function GridSkeleton({ n = 5 }: { n?: number }) {
  return <div className="grid w-full min-w-0 grid-cols-[repeat(2,minmax(0,1fr))] gap-3 md:grid-cols-[repeat(3,minmax(0,1fr))] md:gap-4 lg:grid-cols-[repeat(4,minmax(0,1fr))] xl:grid-cols-[repeat(5,minmax(0,1fr))]">{Array.from({ length: n }).map((_, i) => <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card"><div className="aspect-square animate-pulse bg-muted" /><div className="space-y-2 p-3"><div className="h-3 w-1/3 animate-pulse rounded bg-muted" /><div className="h-4 animate-pulse rounded bg-muted" /><div className="h-9 animate-pulse rounded-xl bg-muted" /></div></div>)}</div>;
}
