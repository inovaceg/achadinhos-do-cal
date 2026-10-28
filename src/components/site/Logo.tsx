import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { settingsQuery } from "@/lib/queries";

export function Logo({ size = 48, showText = true }: { size?: number; showText?: boolean }) {
  const { data: s } = useQuery(settingsQuery);
  return (
    <Link to="/" className="flex min-w-0 items-center gap-2.5" aria-label="Página inicial">
      <img
        src="/assets/achadinhos-do-cal-3d-transparent.png"
        alt={s?.site_name ?? "Achadinhos do Cal"}
        width={size}
        height={size}
        className="shrink-0 rounded-full"
        style={{ width: size, height: size }}
      />
      {showText && (
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate font-display text-sm font-extrabold tracking-tight sm:text-lg">
            {s?.site_name ?? "Achadinhos do Cal"}
          </span>
          <span className="text-[10px] font-medium text-muted-foreground sm:truncate sm:text-xs">
            {s?.slogan ?? "Achou, gostou, economizou!"}
          </span>
        </span>
      )}
    </Link>
  );
}
