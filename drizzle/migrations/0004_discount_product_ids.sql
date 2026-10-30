CREATE OR REPLACE FUNCTION public.discount_product_ids(p_category_slug text DEFAULT NULL, p_store_name text DEFAULT NULL, p_collection uuid DEFAULT NULL, p_query text DEFAULT NULL, p_min numeric DEFAULT NULL, p_max numeric DEFAULT NULL, p_recent boolean DEFAULT false)
RETURNS TABLE(product_id uuid) LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  select p.id from products p
  left join categories c on c.id = p.category_id
  left join stores s on s.id = p.store_id
  where p.active and (p.expires_at is null or p.expires_at > now())
    and (p_category_slug is null or c.slug = p_category_slug)
    and (p_store_name is null or s.name = p_store_name)
    and (p_collection is null or exists (select 1 from video_collection_products v where v.collection_id = p_collection and v.product_id = p.id))
    and (p_query is null or p.name ilike '%' || p_query || '%')
    and (p_min is null or p.price >= p_min) and (p_max is null or p.price <= p_max)
    and (not p_recent or p.created_at > now() - interval '7 days')
  order by case when p.original_price > 0 then (p.original_price - p.price) / p.original_price else 0 end desc
  limit 200
$$;
GRANT EXECUTE ON FUNCTION public.discount_product_ids(text, text, uuid, text, numeric, numeric, boolean) TO anon, authenticated;