-- Habesha Thread schema
-- Run this in the Supabase SQL editor.

create extension if not exists "pgcrypto";

-- PRODUCTS
create table if not exists products (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  description   text,
  price_cents   integer not null check (price_cents >= 0),
  currency      text not null default 'USD',
  category      text,
  collection    text,
  materials     text,
  featured      boolean not null default false,
  created_at    timestamptz not null default now()
);

-- PRODUCT IMAGES
create table if not exists product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id) on delete cascade,
  url         text not null,
  alt         text,
  sort_order  integer not null default 0
);
create index if not exists product_images_product_idx on product_images(product_id);

-- PRODUCT SIZES (stock per size)
create table if not exists product_sizes (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id) on delete cascade,
  size_label  text not null,
  stock_qty   integer not null default 0 check (stock_qty >= 0),
  unique (product_id, size_label)
);
create index if not exists product_sizes_product_idx on product_sizes(product_id);

-- CARTS
create table if not exists carts (
  id          uuid primary key default gen_random_uuid(),
  status      text not null default 'active' check (status in ('active','checked_out','abandoned')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- CART ITEMS
create table if not exists cart_items (
  id                  uuid primary key default gen_random_uuid(),
  cart_id             uuid not null references carts(id) on delete cascade,
  product_id          uuid not null references products(id) on delete restrict,
  size_id             uuid not null references product_sizes(id) on delete restrict,
  qty                 integer not null check (qty > 0),
  price_cents_snapshot integer not null,
  created_at          timestamptz not null default now(),
  unique (cart_id, product_id, size_id)
);
create index if not exists cart_items_cart_idx on cart_items(cart_id);

-- ORDERS
create table if not exists orders (
  id                uuid primary key default gen_random_uuid(),
  order_no          text unique not null,
  cart_id           uuid references carts(id) on delete set null,
  customer_name     text not null,
  customer_email    text not null,
  shipping_address  jsonb not null,
  subtotal_cents    integer not null,
  shipping_cents    integer not null default 0,
  total_cents       integer not null,
  currency          text not null default 'USD',
  status            text not null default 'pending' check (status in ('pending','paid','fulfilled','cancelled')),
  payment_method    text not null default 'fake',
  created_at        timestamptz not null default now(),
  paid_at           timestamptz
);
create index if not exists orders_email_idx on orders(customer_email);

-- ORDER ITEMS
create table if not exists order_items (
  id                   uuid primary key default gen_random_uuid(),
  order_id             uuid not null references orders(id) on delete cascade,
  product_id           uuid references products(id) on delete set null,
  product_name_snapshot text not null,
  product_image_snapshot text,
  size_label           text not null,
  qty                  integer not null check (qty > 0),
  price_cents          integer not null
);
create index if not exists order_items_order_idx on order_items(order_id);

-- Helper: atomically confirm a fake payment.
-- Marks order as paid, decrements stock per line, clears the cart.
create or replace function confirm_fake_payment(p_order_no text)
returns orders
language plpgsql
as $$
declare
  v_order orders;
  r record;
begin
  select * into v_order from orders where order_no = p_order_no for update;
  if not found then
    raise exception 'Order not found' using errcode = 'P0002';
  end if;
  if v_order.status <> 'pending' then
    return v_order;
  end if;

  for r in
    select oi.qty, ps.id as size_id
    from order_items oi
    join product_sizes ps
      on ps.product_id = oi.product_id and ps.size_label = oi.size_label
    where oi.order_id = v_order.id
  loop
    update product_sizes
       set stock_qty = stock_qty - r.qty
     where id = r.size_id and stock_qty >= r.qty;
    if not found then
      raise exception 'Insufficient stock for one of the items' using errcode = 'P0001';
    end if;
  end loop;

  update orders
     set status = 'paid', paid_at = now()
   where id = v_order.id
   returning * into v_order;

  if v_order.cart_id is not null then
    update carts set status = 'checked_out', updated_at = now() where id = v_order.cart_id;
  end if;

  return v_order;
end;
$$;
