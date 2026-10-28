import { useQuery } from "@tanstack/react-query";
import { categoryExactCountQuery } from "@/lib/site-content.queries";
export function CategoryCount({ id }: { id: string }) { const { data, isError } = useQuery(categoryExactCountQuery(id)); return <span className="text-xs text-muted-foreground">{isError ? "" : data === undefined ? "…" : `${data} ofertas`}</span>; }
