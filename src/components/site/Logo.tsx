import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import logoSmall from "@/assets/logo-small.webp.asset.json";
import { settingsQuery } from "@/lib/queries";

export function Logo({ size = 48, showText = true }: { size?: number; showText?: boolean }) {
  const { data: s } = useQuery(settingsQuery);
  return (
    <Link to="/" className="flex min-w-0 items-center gap-2.5" aria-label="Página inicial">
      <img
        src={s?.logo_url || logoSmall.url}
        alt={s?.site_name ?? "Achadinhos do Cal"}
        width={size}
        height={size}
        className="shrink-0 rounded-full"
        style={{ width: size, height: size }}
      />
      {showText && (
        <span className="hidden min-w-0 flex-col leading-tight sm:flex">
          <span className="truncate font-display text-lg font-extrabold tracking-tight">
            {s?.site_name ?? "Achadinhos do Cal"}
          </span>
          <span className="truncate text-xs font-medium text-muted-foreground">
            {s?.slogan ?? "Achou, gostou, economizou!"}
          </span>
        </span>
      )}
    </Link>
  );
}
