import { Link } from "@tanstack/react-router";
import { ExternalLink, Heart, ImageOff } from "lucide-react";
import { calcDiscount, formatBRL } from "@/lib/format";
import { trackClick, useFavorites } from "@/lib/visitor";
import type { Product } from "@/lib/queries";
import { cn } from "@/lib/utils";

export function OfferButton({ product, className }: { product: Product; className?: string }) {
  return (
    <a
      href={product.affiliate_url}
      target="_blank"
      rel="noopener noreferrer nofollow sponsored"
      onClick={() => trackClick({ productId: product.id })}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-glow transition hover:brightness-105 active:scale-[0.98]",
        className,
      )}
    >
      Ver oferta <ExternalLink className="h-4 w-4" />
    </a>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { isFav, toggle } = useFavorites();
  const discount = calcDiscount(product.original_price, product.promo_price);
  const fav = isFav(product.id);
  const badge = product.badge || (product.best_seller ? "Mais vendido" : product.recommended ? "Recomendado" : null);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link to="/produto/$slug" params={{ slug: product.slug }} aria-label={product.name}>
          {product.main_image ? (
            <img
              src={product.main_image}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full place-items-center text-muted-foreground"><ImageOff className="h-8 w-8" /></div>
          )}
        </Link>
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {discount != null && (
            <span className="rounded-lg bg-success px-2 py-1 text-xs font-extrabold text-success-foreground">{discount}% OFF</span>
          )}
          {badge && (
            <span className="rounded-lg bg-secondary px-2 py-1 text-[10px] font-bold uppercase text-secondary-foreground">{badge}</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => toggle(product.id)}
          aria-label={fav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          aria-pressed={fav}
          className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-card/90 shadow-card backdrop-blur transition hover:scale-110"
        >
          <Heart className={cn("h-4 w-4", fav ? "fill-primary text-primary" : "text-foreground")} />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-primary">Loja: {product.store}</span>
        <Link to="/produto/$slug" params={{ slug: product.slug }} className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug hover:text-primary">
          {product.name}
        </Link>
        <div className="mt-auto pt-1">
          {product.original_price != null && discount != null && (
            <p className="text-xs text-muted-foreground line-through">De: {formatBRL(product.original_price)}</p>
          )}
          {product.promo_price != null && (
            <p className="font-display text-lg font-extrabold leading-tight">
              <span className="text-xs font-semibold text-muted-foreground">Por: </span>
              {formatBRL(product.promo_price)}
            </p>
          )}
        </div>
        <OfferButton product={product} className="mt-2 w-full py-2.5 text-xs sm:text-sm" />
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

export function GridSkeleton({ n = 5 }: { n?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="aspect-square animate-pulse bg-muted" />
          <div className="space-y-2 p-3">
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-4 animate-pulse rounded bg-muted" />
            <div className="h-9 animate-pulse rounded-xl bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
