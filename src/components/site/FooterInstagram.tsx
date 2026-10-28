import { Instagram } from "lucide-react";

export function FooterInstagram() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-10">
      <section className="flex flex-col gap-6 rounded-2xl border border-orange-400/25 bg-black p-6 text-white shadow-sm sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <div className="flex items-start gap-4 sm:items-center sm:gap-5">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-700 sm:h-14 sm:w-14">
            <Instagram className="h-6 w-6 text-white sm:h-7 sm:w-7" aria-hidden="true" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold leading-snug sm:text-xl">Siga o Achadinhos do Cal no Instagram!</h2>
            <p className="max-w-2xl text-sm leading-relaxed text-white/75">
              Achadinhos incríveis, ofertas imperdíveis e novidades todos os dias. Não perca nenhuma oportunidade de economizar!
            </p>
            <p className="text-sm font-semibold text-orange-300">@achadinhosdocal</p>
          </div>
        </div>
        <a
          href="https://www.instagram.com/achadinhosdocal/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-center text-sm font-bold tracking-wide text-black transition-colors hover:bg-orange-400 motion-reduce:transition-none lg:w-auto lg:shrink-0"
        >
          <Instagram className="h-4 w-4" aria-hidden="true" />
          SEGUIR NO INSTAGRAM
        </a>
      </section>
    </div>
  );
}
