CREATE OR REPLACE FUNCTION public.product_popularity() RETURNS TABLE(product_id uuid, clicks integer, views integer) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  select p.id, p.click_count, p.view_count from products p where p.active and (p.click_count > 0 or p.view_count > 0)
$$;
GRANT EXECUTE ON FUNCTION public.product_popularity() TO anon, authenticated;