-- CampusBite Supabase Database Schema (VIT Chennai Setup)
-- Safe to run multiple times in Supabase Dashboard > SQL Editor

-- 1. Create Custom Enum Types Safely
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('customer','staff','admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cust_type') THEN
        CREATE TYPE cust_type AS ENUM ('student','faculty','outsider','event_team');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM ('placed','preparing','ready','collected','cancelled');
    END IF;
END $$;

-- 2. Clean Drop Existing Tables (Cascade) for Fresh Slate
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS wallet_txns CASCADE;
DROP TABLE IF EXISTS wallets CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS outlets CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- 3. Create Core Database Tables
CREATE TABLE outlets (
    id text PRIMARY KEY,
    location text NOT NULL,
    name text NOT NULL,
    is_event boolean DEFAULT false,
    is_open boolean DEFAULT true
);

CREATE TABLE menu_items (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    outlet_id text REFERENCES outlets ON DELETE CASCADE,
    name text NOT NULL,
    price int NOT NULL CHECK (price >= 0),
    available boolean DEFAULT true,
    is_veg boolean DEFAULT true,
    category text DEFAULT 'general'
);

CREATE TABLE profiles (
    id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    full_name text,
    role user_role DEFAULT 'customer',
    cust_type cust_type DEFAULT 'student',
    outlet_id text REFERENCES outlets
);

CREATE TABLE wallets (
    user_id uuid PRIMARY KEY REFERENCES profiles ON DELETE CASCADE,
    balance int NOT NULL DEFAULT 0 CHECK (balance >= 0)
);

CREATE TABLE wallet_txns (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id uuid REFERENCES profiles,
    amount int NOT NULL,
    kind text NOT NULL,
    ref text UNIQUE,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE orders (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id uuid REFERENCES profiles,
    outlet_id text REFERENCES outlets,
    token text NOT NULL,
    status order_status DEFAULT 'placed',
    total int NOT NULL,
    method text DEFAULT 'wallet',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE order_items (
    order_id bigint REFERENCES orders ON DELETE CASCADE,
    item_id bigint REFERENCES menu_items,
    name text,
    price int,
    qty int CHECK (qty > 0)
);

CREATE TABLE payments (
    razorpay_order_id text PRIMARY KEY,
    user_id uuid REFERENCES profiles,
    amount int,
    status text DEFAULT 'created'
);

CREATE TABLE settings (
    id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    event_mode boolean DEFAULT false
);

INSERT INTO settings (id, event_mode) VALUES (1, false) ON CONFLICT (id) DO NOTHING;

-- 4. Automatic User Profile & Wallet Creation Trigger
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  INSERT INTO profiles(id, full_name) VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', new.email));
  INSERT INTO wallets(user_id) VALUES (new.id);
  RETURN new;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 5. Stored Procedures
-- Idempotent wallet credit
CREATE OR REPLACE FUNCTION credit_wallet(p_user uuid, p_amount int, p_kind text, p_ref text)
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE bal int;
BEGIN
  INSERT INTO wallet_txns(user_id, amount, kind, ref) VALUES (p_user, p_amount, p_kind, p_ref)
    ON CONFLICT (ref) DO NOTHING;
  IF FOUND THEN 
    UPDATE wallets SET balance = balance + p_amount WHERE user_id = p_user; 
  END IF;
  SELECT balance INTO bal FROM wallets WHERE user_id = p_user;
  RETURN bal;
END $$;

-- Atomic Order Placement Procedure
CREATE OR REPLACE FUNCTION place_order(p_user uuid, p_outlet text, p_items jsonb)
RETURNS orders LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE o outlets; ev boolean; tot int; cnt int; bal int; ord orders;
BEGIN
  SELECT * INTO o FROM outlets WHERE id = p_outlet;
  SELECT event_mode INTO ev FROM settings;
  IF o.id IS NULL OR NOT o.is_open OR o.is_event <> ev THEN 
    RAISE EXCEPTION 'Outlet is closed or unavailable'; 
  END IF;

  SELECT sum(m.price*(i->>'qty')::int), count(*) INTO tot, cnt
    FROM jsonb_array_elements(p_items) i
    JOIN menu_items m ON m.id = (i->>'item_id')::bigint AND m.outlet_id = p_outlet AND m.available;
    
  IF tot IS NULL OR cnt <> jsonb_array_length(p_items) THEN 
    RAISE EXCEPTION 'Invalid or sold-out items'; 
  END IF;

  UPDATE wallets SET balance = balance - tot WHERE user_id = p_user AND balance >= tot RETURNING balance INTO bal;
  IF bal IS NULL THEN 
    RAISE EXCEPTION 'Insufficient wallet balance'; 
  END IF;

  INSERT INTO orders(user_id, outlet_id, token, total)
    VALUES(p_user, p_outlet, lpad((floor(random()*900)+100)::text, 3, '0'), tot) RETURNING * INTO ord;

  INSERT INTO order_items SELECT ord.id, m.id, m.name, m.price, (i->>'qty')::int
    FROM jsonb_array_elements(p_items) i JOIN menu_items m ON m.id = (i->>'item_id')::bigint;

  INSERT INTO wallet_txns(user_id, amount, kind, ref) VALUES (p_user, -tot, 'order', 'order:'||ord.id);
  RETURN ord;
END $$;

-- 6. Enable Row Level Security (RLS) & Define Access Policies
ALTER TABLE outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_txns ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pub_outlets ON outlets;
DROP POLICY IF EXISTS pub_menu ON menu_items;
DROP POLICY IF EXISTS pub_settings ON settings;
DROP POLICY IF EXISTS own_profile ON profiles;
DROP POLICY IF EXISTS own_wallet ON wallets;
DROP POLICY IF EXISTS own_txns ON wallet_txns;
DROP POLICY IF EXISTS orders_read ON orders;
DROP POLICY IF EXISTS items_read ON order_items;

CREATE POLICY pub_outlets ON outlets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY pub_menu ON menu_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY pub_settings ON settings FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY own_profile ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY own_wallet ON wallets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY own_txns ON wallet_txns FOR SELECT USING (user_id = auth.uid());

CREATE POLICY orders_read ON orders FOR SELECT USING (
  user_id = auth.uid()
  OR outlet_id = (SELECT outlet_id FROM profiles WHERE id = auth.uid())
  OR EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY items_read ON order_items FOR SELECT USING (
  EXISTS(SELECT 1 FROM orders o WHERE o.id = order_id)
);

-- 7. Supabase Realtime Subscription Setup
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;
