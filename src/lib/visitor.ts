import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const VISITOR_KEY = "adc_visitor";
const FAV_KEY = "adc_favorites";

export function getVisitorId() {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

/** Records a click without blocking navigation; failures are ignored. */
export function trackClick(opts: { productId?: string; bannerId?: string }) {
  try {
    void supabase
      .rpc("register_click", {
        _product_id: opts.productId ?? (null as unknown as string),
        _banner_id: opts.bannerId ?? (null as unknown as string),
        _visitor: getVisitorId(),
      })
      .then(() => undefined, () => undefined);
  } catch {
    /* ignore */
  }
}

export function trackView(productId: string) {
  try {
    void supabase
      .rpc("register_view", { _product_id: productId, _visitor: getVisitorId() })
      .then(() => undefined, () => undefined);
  } catch {
    /* ignore */
  }
}

function readFavs(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favs, setFavs] = useState<string[]>([]);
  useEffect(() => {
    setFavs(readFavs());
    const sync = () => setFavs(readFavs());
    window.addEventListener("adc-favs", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("adc-favs", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const toggle = useCallback((id: string) => {
    const cur = readFavs();
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    localStorage.setItem(FAV_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("adc-favs"));
  }, []);
  return { favs, toggle, isFav: (id: string) => favs.includes(id) };
}
