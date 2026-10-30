ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS price numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS external_url text,
  ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS bestseller boolean NOT NULL DEFAULT false;
ALTER TABLE public.products ALTER COLUMN affiliate_url DROP NOT NULL, ALTER COLUMN store DROP NOT NULL;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS image_url text, ADD COLUMN IF NOT EXISTS mobile_image_url text;
CREATE UNIQUE INDEX IF NOT EXISTS stores_name_key ON public.stores(name);