ALTER TABLE public.products ADD COLUMN IF NOT EXISTS videos text[] NOT NULL DEFAULT '{}';

CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ select public.has_role(auth.uid(), 'admin') $$;

CREATE TABLE public.video_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL, cover_url text NOT NULL, video_url text NOT NULL,
  active boolean NOT NULL DEFAULT true, sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.video_collections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.video_collections TO authenticated;
GRANT ALL ON public.video_collections TO service_role;
ALTER TABLE public.video_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active" ON public.video_collections FOR SELECT TO anon, authenticated USING (active OR public.is_admin());
CREATE POLICY "admin write" ON public.video_collections FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.video_collection_products (
  collection_id uuid NOT NULL REFERENCES public.video_collections(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  PRIMARY KEY (collection_id, product_id));
GRANT SELECT ON public.video_collection_products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.video_collection_products TO authenticated;
GRANT ALL ON public.video_collection_products TO service_role;
ALTER TABLE public.video_collection_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON public.video_collection_products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write" ON public.video_collection_products FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.promotional_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL, image_url text NOT NULL,
  category_id uuid, collection_id uuid,
  active boolean NOT NULL DEFAULT true, sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT promotional_banners_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE,
  CONSTRAINT promotional_banners_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES public.video_collections(id) ON DELETE CASCADE,
  CONSTRAINT one_target CHECK ((category_id IS NULL) <> (collection_id IS NULL)));
GRANT SELECT ON public.promotional_banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promotional_banners TO authenticated;
GRANT ALL ON public.promotional_banners TO service_role;
ALTER TABLE public.promotional_banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active" ON public.promotional_banners FOR SELECT TO anon, authenticated USING (active OR public.is_admin());
CREATE POLICY "admin write" ON public.promotional_banners FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.save_video_collection(p_id uuid, p_title text, p_cover_url text, p_video_url text, p_active boolean, p_sort_order integer, p_product_ids uuid[])
RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE v_id uuid;
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Acesso negado'; END IF;
  IF p_id IS NULL THEN
    INSERT INTO video_collections(title, cover_url, video_url, active, sort_order) VALUES (p_title, p_cover_url, p_video_url, p_active, p_sort_order) RETURNING id INTO v_id;
  ELSE
    UPDATE video_collections SET title=p_title, cover_url=p_cover_url, video_url=p_video_url, active=p_active, sort_order=p_sort_order WHERE id=p_id RETURNING id INTO v_id;
    DELETE FROM video_collection_products WHERE collection_id = v_id;
  END IF;
  INSERT INTO video_collection_products(collection_id, product_id, sort_order)
    SELECT v_id, pid, ord::int - 1 FROM unnest(p_product_ids) WITH ORDINALITY AS t(pid, ord);
  RETURN v_id;
END $$;