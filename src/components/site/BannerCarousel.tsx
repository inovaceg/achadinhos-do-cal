import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Banner } from "@/lib/queries";
import { trackClick } from "@/lib/visitor";

export function BannerSlide({ b, onClick }: { b: Banner; onClick?: () => void }) {
  const external = b.button_url && /^https?:\/\//.test(b.button_url);
  return (
    <div className="relative h-full w-full">
      <picture>
        {b.image_mobile && <source media="(max-width: 767px)" srcSet={b.image_mobile} />}
        {b.image_desktop ? (
          <img src={b.image_desktop} alt={b.title ?? ""} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-dark" />
        )}
      </picture>
      {(b.title || b.subtitle || b.button_text) && (
        <div className="absolute inset-0 flex items-center bg-gradient-to-r from-secondary/80 via-secondary/30 to-transparent">
          <div className="max-w-lg space-y-3 px-6 text-secondary-foreground md:px-12">
            {b.title && <h2 className="font-display text-2xl font-extrabold leading-tight md:text-5xl">{b.title}</h2>}
            {b.subtitle && <p className="text-sm opacity-90 md:text-lg">{b.subtitle}</p>}
            {b.button_text && b.button_url && (
              <a
                href={b.button_url}
                onClick={onClick}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="inline-flex rounded-xl bg-gradient-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-glow"
              >
                {b.button_text}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DefaultHero() {
  return (
    <div className="relative flex h-full items-center overflow-hidden bg-gradient-dark">
      <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary/40 blur-3xl" />
      <div className="relative grid w-full items-center gap-6 px-6 py-6 md:grid-cols-[1fr_auto] md:px-12 md:py-0">
        <div className="space-y-3 text-secondary-foreground">
          <span className="inline-block rounded-full bg-primary/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-glow">
            Curadoria diária
          </span>
          <h1 className="font-display text-3xl font-extrabold leading-tight md:text-5xl">
            Achou, gostou, <span className="text-primary">economizou!</span>
          </h1>
          <p className="max-w-md text-sm opacity-85 md:text-base">
            Os melhores achadinhos da Shopee, Mercado Livre, Amazon e Magalu reunidos em um só lugar.
          </p>
          <a href="/ofertas" className="inline-flex rounded-xl bg-gradient-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-glow">
            Ver todas as ofertas
          </a>
        </div>
        <img src="/assets/achadinhos-do-cal-3d-transparent.png" alt="Logo Achadinhos do Cal" className="mx-auto h-32 w-32 object-contain drop-shadow-2xl sm:h-40 sm:w-40 md:h-56 md:w-56" />
      </div>
    </div>
  );
}

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [i, setI] = useState(0);
  const n = banners.length;
  useEffect(() => {
    if (n < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 6000);
    return () => clearInterval(t);
  }, [n]);

  return (
    <section aria-label="Destaques" className={`relative overflow-hidden rounded-3xl shadow-card ${n === 0 ? "h-auto min-h-[260px] md:h-[380px]" : "h-[260px] md:h-[380px]"}`}>
      {n === 0 ? (
        <DefaultHero />
      ) : (
        banners.map((b, idx) => (
          <div
            key={b.id}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: idx === i ? 1 : 0, pointerEvents: idx === i ? "auto" : "none" }}
            aria-hidden={idx !== i}
          >
            <BannerSlide b={b} onClick={() => trackClick({ bannerId: b.id })} />
          </div>
        ))
      )}
      {n > 1 && (
        <>
          <button aria-label="Anterior" onClick={() => setI((i - 1 + n) % n)} className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-card/80 backdrop-blur">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button aria-label="Próximo" onClick={() => setI((i + 1) % n)} className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-card/80 backdrop-blur">
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {banners.map((b, idx) => (
              <button key={b.id} aria-label={`Banner ${idx + 1}`} onClick={() => setI(idx)} className={`h-2 rounded-full transition-all ${idx === i ? "w-6 bg-primary" : "w-2 bg-card/70"}`} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
