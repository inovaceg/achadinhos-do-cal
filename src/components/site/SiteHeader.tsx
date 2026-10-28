import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, Menu, Search, Tag } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { CategoryIcon } from "./CategoryIcon";
import { categoriesQuery } from "@/lib/queries";
import { useFavorites } from "@/lib/visitor";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

function SearchBox({ onDone }: { onDone?: () => void }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  return (
    <form
      role="search"
      className="relative w-full"
      onSubmit={(e) => {
        e.preventDefault();
        navigate({ to: "/ofertas", search: { q: q.trim() || undefined } });
        onDone?.();
      }}
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar achadinhos, lojas, categorias..."
        aria-label="Buscar produtos"
        className="h-11 w-full rounded-full border border-input bg-muted pl-4 pr-12 text-sm outline-none transition focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/20"
      />
      <button
        type="submit"
        aria-label="Buscar"
        className="absolute right-1 top-1 grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground"
      >
        <Search className="h-4 w-4" />
      </button>
    </form>
  );
}

export function SiteHeader() {
  const { data: cats = [] } = useQuery(categoriesQuery);
  const { favs } = useFavorites();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-6">
        <Logo size={44} />
        <div className="hidden md:block">
          <SearchBox />
        </div>
        <div className="flex items-center gap-1 justify-self-end">
          <Link
            to="/ofertas"
            className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold hover:bg-accent hover:text-accent-foreground md:flex"
          >
            <Tag className="h-4 w-4" /> Todas as ofertas
          </Link>
          <Link
            to="/favoritos"
            aria-label="Favoritos"
            className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-accent"
          >
            <Heart className="h-5 w-5" />
            {favs.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {favs.length}
              </span>
            )}
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button aria-label="Abrir menu" className="grid h-10 w-10 place-items-center rounded-full hover:bg-accent md:hidden">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-2 flex flex-col gap-1 px-4 pb-6">
                <Link to="/ofertas" onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 font-semibold hover:bg-accent">
                  Todas as ofertas
                </Link>
                <Link to="/favoritos" onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 font-semibold hover:bg-accent">
                  Meus favoritos
                </Link>
                <p className="mt-3 px-3 text-xs font-semibold uppercase text-muted-foreground">Categorias</p>
                {cats.map((c) => (
                  <Link
                    key={c.id}
                    to="/categoria/$slug"
                    params={{ slug: c.slug }}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-accent"
                  >
                    <CategoryIcon name={c.icon} className="h-4 w-4 text-primary" /> {c.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <div className="px-4 pb-2.5 md:hidden">
        <SearchBox />
      </div>
      <nav className="hidden border-t border-border md:block">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-1.5">
          {cats.map((c) => (
            <Link
              key={c.id}
              to="/categoria/$slug"
              params={{ slug: c.slug }}
              className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
              activeProps={{ className: "bg-accent text-accent-foreground" }}
            >
              <CategoryIcon name={c.icon} className="h-3.5 w-3.5" /> {c.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
