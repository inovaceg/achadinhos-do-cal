import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Heart, Info, Share2, Store, Tag } from "lucide-react";
import { toast } from "sonner";
import { getProductPage } from "@/lib/public.functions";
import { calcDiscount, formatBRL } from "@/lib/format";
import { absoluteUrl } from "@/lib/media";
import { relatedQuery, type Product } from "@/lib/queries";
import { trackView, useFavorites } from "@/lib/visitor";
import { OfferButton, ProductGrid } from "@/components/site/ProductCard";
import { ProductMediaGallery } from "@/components/site/ProductMediaGallery";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_site/produto/$slug")({
  loader: async ({ params }) => {
    const res = await getProductPage({ data: { slug: params.slug } });
    if (!res.product) throw notFound();
    return res as { product: Product; images: { url: string }[]; origin: string };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Produto indisponível — Achadinhos do Cal" }, { name: "robots", content: "noindex" }] };
    const p = loaderData.product;
    const price = p.promo_price != null ? ` por ${formatBRL(p.promo_price)}` : "";
    const title = `${p.name}${price} — Achadinhos do Cal`;
    const desc = (p.description || `Achadinho na ${p.store}${price}. Confira a oferta!`).slice(0, 160);
    const img = absoluteUrl(p.main_image, loaderData.origin);
    const url = `${loaderData.origin}/produto/${p.slug}`;
    const ld = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: p.name,
      image: img ? [img] : undefined,
      description: p.description ?? undefined,
      brand: { "@type": "Brand", name: p.store },
      offers: p.promo_price != null ? { "@type": "Offer", price: p.promo_price, priceCurrency: "BRL", url: p.affiliate_url } : undefined,
    };
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "product" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        ...(img ? [{ property: "og:image", content: img }, { name: "twitter:image", content: img }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [{ type: "application/ld+json", children: JSON.stringify(ld) }],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Oferta indisponível</h1>
      <p className="mt-2 text-muted-foreground">Este produto não está mais disponível ou foi removido.</p>
      <Link to="/ofertas" className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground">Ver outras ofertas</Link>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product: p, images, origin } = Route.useLoaderData();
  const { isFav, toggle } = useFavorites();
  const discount = calcDiscount(p.original_price, p.promo_price);
  const { data: related = [] } = useQuery(relatedQuery(p.category_id, p.id));

  useEffect(() => {
    trackView(p.id);
  }, [p.id]);

  const pageUrl = `${origin || (typeof window !== "undefined" ? window.location.origin : "")}/produto/${p.slug}`;
  const shareText = `Olha esse achadinho que encontrei no Achadinhos do Cal! ${p.name}${p.promo_price != null ? ` por ${formatBRL(p.promo_price)}` : ""}. Confira a oferta: ${pageUrl}`;

  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: p.name, text: shareText, url: pageUrl }); return; } catch { /* cancelled */ }
    }
    await navigator.clipboard.writeText(pageUrl);
    toast.success("Link copiado!");
  };

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl space-y-6 px-4 py-6 md:space-y-12">
      <nav className="min-w-0 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">Início</Link>
        {p.categories && (
          <> / <Link to="/categoria/$slug" params={{ slug: p.categories.slug }} className="hover:text-primary">{p.categories.name}</Link></>
        )}
      </nav>
      <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
        <ProductMediaGallery productId={p.id} name={p.name} primary={p.main_image} images={images.map((item) => item.url)} videos={p.videos ?? []} />
        <div className="min-w-0 space-y-5">
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-accent-foreground"><Store className="h-3.5 w-3.5" /> {p.store}</span>
            {p.categories && <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1"><Tag className="h-3.5 w-3.5" /> {p.categories.name}</span>}
            {p.best_seller && <span className="rounded-full bg-secondary px-3 py-1 text-secondary-foreground">Mais vendido</span>}
          </div>
          <h1 className="break-words text-2xl font-extrabold leading-tight md:text-3xl">{p.name}</h1>
          <div className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-card">
            {p.original_price != null && discount != null && (
              <p className="text-sm text-muted-foreground">De: <span className="line-through">{formatBRL(p.original_price)}</span></p>
            )}
            <div className="flex flex-wrap items-center gap-3">
              {p.promo_price != null && <p className="font-display text-3xl font-extrabold">Por: {formatBRL(p.promo_price)}</p>}
              {discount != null && <span className="rounded-lg bg-success px-2.5 py-1 text-sm font-extrabold text-success-foreground">{discount}% OFF</span>}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Preço registrado em {new Date(p.price_updated_at).toLocaleDateString("pt-BR")}</p>
            <OfferButton product={p} className="mt-4 w-full py-4 text-base" />
            <div className="mt-3 grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-3">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="col-span-1 flex min-w-0 flex-wrap items-center justify-center gap-1.5 rounded-xl border border-border py-2.5 text-sm font-semibold hover:bg-accent sm:col-span-1"
              >
                WhatsApp
              </a>
              <button onClick={share} className="flex min-w-0 flex-wrap items-center justify-center gap-1.5 rounded-xl border border-border py-2.5 text-sm font-semibold hover:bg-accent">
                <Share2 className="h-4 w-4" /> Compartilhar
              </button>
              <button onClick={() => toggle(p.id)} className="flex min-w-0 flex-wrap items-center justify-center gap-1.5 rounded-xl border border-border py-2.5 text-sm font-semibold hover:bg-accent">
                <Heart className={cn("h-4 w-4", isFav(p.id) && "fill-primary text-primary")} /> {isFav(p.id) ? "Salvo" : "Salvar"}
              </button>
            </div>
          </div>
          <p className="flex gap-2 rounded-xl bg-accent p-3 text-xs text-accent-foreground">
            <Info className="h-4 w-4 shrink-0" />
            Preço e disponibilidade podem mudar na loja. A compra é concluída no site da {p.store}; o Achadinhos do Cal não processa pagamentos e pode receber comissão, sem custo extra para você.
          </p>
          {p.description && (
            <div className="min-w-0 space-y-2 break-words">
              <h2 className="text-lg font-bold">Descrição</h2>
              <p className="whitespace-pre-line break-words text-sm leading-relaxed text-muted-foreground">{p.description}</p>
            </div>
          )}
          {p.features.length > 0 && (
            <div className="min-w-0 space-y-2 break-words">
              <h2 className="text-lg font-bold">Características principais</h2>
              <ul className="list-inside list-disc space-y-1 break-words text-sm text-muted-foreground">
                {p.features.map((f) => <li key={f}>{f}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>
      {related.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-extrabold">Produtos relacionados</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
