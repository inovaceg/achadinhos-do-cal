
create type public.app_role as enum ('admin','user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique(user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.user_roles where user_id=_user_id and role=_role) $$;

create policy "own roles readable" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

-- first user to sign up becomes admin
create or replace function public.handle_first_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role='admin') then
    insert into public.user_roles(user_id, role) values (new.id,'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created_admin after insert on auth.users for each row execute function public.handle_first_admin();

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path=public as $$
begin new.updated_at = now(); return new; end $$;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon text,
  image_url text,
  description text,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "public read active categories" on public.categories for select using (active or public.has_role(auth.uid(),'admin'));
create policy "admin write categories" on public.categories for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);
grant select on public.stores to anon, authenticated;
grant insert, update, delete on public.stores to authenticated;
grant all on public.stores to service_role;
alter table public.stores enable row level security;
create policy "public read stores" on public.stores for select using (true);
create policy "admin write stores" on public.stores for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  features text[] not null default '{}',
  category_id uuid references public.categories(id) on delete set null,
  store text not null default 'Shopee',
  original_price numeric(12,2),
  promo_price numeric(12,2),
  affiliate_url text not null,
  main_image text,
  tags text[] not null default '{}',
  active boolean not null default true,
  featured boolean not null default false,
  best_seller boolean not null default false,
  recommended boolean not null default false,
  badge text,
  click_count int not null default 0,
  view_count int not null default 0,
  price_updated_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.products(category_id);
create index on public.products(created_at desc);
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "public read active products" on public.products for select using ((active and (expires_at is null or expires_at > now())) or public.has_role(auth.uid(),'admin'));
create policy "admin write products" on public.products for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  sort_order int not null default 0
);
grant select on public.product_images to anon, authenticated;
grant insert, update, delete on public.product_images to authenticated;
grant all on public.product_images to service_role;
alter table public.product_images enable row level security;
create policy "public read images" on public.product_images for select using (true);
create policy "admin write images" on public.product_images for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title text,
  subtitle text,
  button_text text,
  button_url text,
  image_desktop text,
  image_mobile text,
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean not null default true,
  sort_order int not null default 0,
  click_count int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.banners to anon, authenticated;
grant insert, update, delete on public.banners to authenticated;
grant all on public.banners to service_role;
alter table public.banners enable row level security;
create policy "public read live banners" on public.banners for select using ((active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now())) or public.has_role(auth.uid(),'admin'));
create policy "admin write banners" on public.banners for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.click_events (
  id bigint generated always as identity primary key,
  product_id uuid references public.products(id) on delete cascade,
  banner_id uuid references public.banners(id) on delete cascade,
  visitor_hash text not null,
  created_at timestamptz not null default now()
);
create index on public.click_events(created_at);
create index on public.click_events(product_id, visitor_hash, created_at);
grant select on public.click_events to authenticated;
grant all on public.click_events to service_role;
alter table public.click_events enable row level security;
create policy "admin read clicks" on public.click_events for select to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.product_views (
  id bigint generated always as identity primary key,
  product_id uuid not null references public.products(id) on delete cascade,
  visitor_hash text not null,
  created_at timestamptz not null default now()
);
create index on public.product_views(product_id, visitor_hash, created_at);
grant select on public.product_views to authenticated;
grant all on public.product_views to service_role;
alter table public.product_views enable row level security;
create policy "admin read views" on public.product_views for select to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.site_settings (
  id int primary key default 1 check (id = 1),
  site_name text not null default 'Achadinhos do Cal',
  slogan text not null default 'Achou, gostou, economizou!',
  logo_url text,
  favicon_url text,
  primary_color text not null default '#FF6B00',
  share_image_url text,
  instagram text,
  tiktok text,
  whatsapp text,
  contact_email text,
  footer_text text default 'Curadoria diária dos melhores achadinhos e promoções da internet.',
  affiliate_notice text default 'Este site pode receber comissões por compras realizadas através dos links divulgados, sem nenhum custo adicional para você.',
  seo_title text default 'Achadinhos do Cal — Ofertas e achadinhos da Shopee, Amazon e Mercado Livre',
  seo_description text default 'Os melhores achadinhos e promoções selecionados todos os dias. Achou, gostou, economizou!',
  updated_at timestamptz not null default now()
);
insert into public.site_settings(id) values (1);
grant select on public.site_settings to anon, authenticated;
grant update on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "public read settings" on public.site_settings for select using (true);
create policy "admin update settings" on public.site_settings for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- anti-spam click & view registration: one count per visitor per item per 30 min
create or replace function public.register_click(_product_id uuid, _banner_id uuid, _visitor text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if _visitor is null or length(_visitor) < 8 or length(_visitor) > 100 then return; end if;
  if (select count(*) from click_events where visitor_hash=_visitor and created_at > now()-interval '1 minute') > 20 then return; end if;
  if _product_id is not null then
    if exists(select 1 from click_events where product_id=_product_id and visitor_hash=_visitor and created_at > now()-interval '30 minutes') then return; end if;
    if not exists(select 1 from products where id=_product_id) then return; end if;
    insert into click_events(product_id, visitor_hash) values (_product_id,_visitor);
    update products set click_count = click_count+1 where id=_product_id;
  elsif _banner_id is not null then
    if exists(select 1 from click_events where banner_id=_banner_id and visitor_hash=_visitor and created_at > now()-interval '30 minutes') then return; end if;
    if not exists(select 1 from banners where id=_banner_id) then return; end if;
    insert into click_events(banner_id, visitor_hash) values (_banner_id,_visitor);
    update banners set click_count = click_count+1 where id=_banner_id;
  end if;
end $$;

create or replace function public.register_view(_product_id uuid, _visitor text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if _visitor is null or length(_visitor) < 8 or length(_visitor) > 100 then return; end if;
  if exists(select 1 from product_views where product_id=_product_id and visitor_hash=_visitor and created_at > now()-interval '30 minutes') then return; end if;
  if not exists(select 1 from products where id=_product_id) then return; end if;
  insert into product_views(product_id, visitor_hash) values (_product_id,_visitor);
  update products set view_count = view_count+1 where id=_product_id;
end $$;
grant execute on function public.register_click(uuid,uuid,text) to anon, authenticated;
grant execute on function public.register_view(uuid,text) to anon, authenticated;

insert into public.categories(name, slug, icon, sort_order) values
('Eletrônicos','eletronicos','Smartphone',1),
('Casa e cozinha','casa-e-cozinha','CookingPot',2),
('Beleza','beleza','Sparkles',3),
('Moda','moda','Shirt',4),
('Acessórios','acessorios','Watch',5),
('Games','games','Gamepad2',6),
('Informática','informatica','Laptop',7),
('Ferramentas','ferramentas','Wrench',8),
('Pets','pets','PawPrint',9),
('Ofertas diversas','ofertas-diversas','Tag',10);

insert into public.stores(name) values ('Shopee'),('Mercado Livre'),('Amazon'),('Magalu'),('AliExpress'),('Outra');

-- storage policies for media bucket
create policy "public read media" on storage.objects for select using (bucket_id='media');
create policy "admin upload media" on storage.objects for insert to authenticated with check (bucket_id='media' and public.has_role(auth.uid(),'admin'));
create policy "admin update media" on storage.objects for update to authenticated using (bucket_id='media' and public.has_role(auth.uid(),'admin'));
create policy "admin delete media" on storage.objects for delete to authenticated using (bucket_id='media' and public.has_role(auth.uid(),'admin'));
