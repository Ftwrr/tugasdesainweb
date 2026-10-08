import pg from 'pg';
const { Client } = pg;

const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || 'postgresql://postgres.cmtjkwqfejknsboyjvxq:TLSServer2026!SecuredPass@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres';

const schemaSql = `
-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  balance NUMERIC DEFAULT 250000,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Server Plans Table
CREATE TABLE IF NOT EXISTS public.server_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  game_type TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Game Server',
  badge TEXT,
  vcpu INT NOT NULL,
  ram_gb INT NOT NULL,
  ssd_gb INT NOT NULL,
  bandwidth_tb NUMERIC NOT NULL,
  price_hourly NUMERIC NOT NULL,
  price_monthly NUMERIC NOT NULL,
  icon TEXT NOT NULL,
  description TEXT,
  features TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Rented Servers Table
CREATE TABLE IF NOT EXISTS public.rented_servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.server_plans(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  game_type TEXT NOT NULL,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'stopped', 'starting', 'restarting', 'suspended')),
  ip_address TEXT NOT NULL,
  port INT NOT NULL,
  region TEXT NOT NULL DEFAULT 'ap-southeast-1',
  vcpu INT NOT NULL DEFAULT 2,
  ram_gb INT NOT NULL DEFAULT 4,
  ssd_gb INT NOT NULL DEFAULT 40,
  current_cpu_pct NUMERIC DEFAULT 24.5,
  current_ram_pct NUMERIC DEFAULT 58.2,
  current_disk_pct NUMERIC DEFAULT 32.0,
  auto_renew BOOLEAN DEFAULT TRUE,
  monthly_cost NUMERIC NOT NULL DEFAULT 85000,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Server Logs Table
CREATE TABLE IF NOT EXISTS public.server_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES public.rented_servers(id) ON DELETE CASCADE,
  log_type TEXT NOT NULL DEFAULT 'stdout',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Server Activities Table
CREATE TABLE IF NOT EXISTS public.server_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES public.rented_servers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  server_id UUID REFERENCES public.rented_servers(id) ON DELETE SET NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'cancelled', 'refunded')),
  payment_method TEXT DEFAULT 'QRIS / E-Wallet',
  paid_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Support Tickets Table
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  department TEXT DEFAULT 'Technical',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.server_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rented_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.server_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.server_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public server plans are viewable by everyone" ON public.server_plans;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own servers" ON public.rented_servers;
DROP POLICY IF EXISTS "Users can insert own servers" ON public.rented_servers;
DROP POLICY IF EXISTS "Users can update own servers" ON public.rented_servers;
DROP POLICY IF EXISTS "Users can delete own servers" ON public.rented_servers;
DROP POLICY IF EXISTS "Users can view own logs" ON public.server_logs;
DROP POLICY IF EXISTS "Users can insert own logs" ON public.server_logs;
DROP POLICY IF EXISTS "Users can view own activities" ON public.server_activities;
DROP POLICY IF EXISTS "Users can insert own activities" ON public.server_activities;
DROP POLICY IF EXISTS "Users can view own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can insert own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can insert own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can update own tickets" ON public.support_tickets;

-- Policies for server_plans (publicly readable)
CREATE POLICY "Public server plans are viewable by everyone"
ON public.server_plans FOR SELECT
USING (true);

-- Policies for profiles
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING ((select auth.uid()) = id)
WITH CHECK ((select auth.uid()) = id);

-- Policies for rented_servers
CREATE POLICY "Users can view own servers"
ON public.rented_servers FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own servers"
ON public.rented_servers FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own servers"
ON public.rented_servers FOR UPDATE
TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own servers"
ON public.rented_servers FOR DELETE
TO authenticated
USING ((select auth.uid()) = user_id);

-- Policies for server_logs
CREATE POLICY "Users can view own logs"
ON public.server_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.rented_servers rs
    WHERE rs.id = server_logs.server_id AND rs.user_id = (select auth.uid())
  )
);

CREATE POLICY "Users can insert own logs"
ON public.server_logs FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.rented_servers rs
    WHERE rs.id = server_logs.server_id AND rs.user_id = (select auth.uid())
  )
);

-- Policies for server_activities
CREATE POLICY "Users can view own activities"
ON public.server_activities FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own activities"
ON public.server_activities FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

-- Policies for invoices
CREATE POLICY "Users can view own invoices"
ON public.invoices FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own invoices"
ON public.invoices FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

-- Policies for support_tickets
CREATE POLICY "Users can view own tickets"
ON public.support_tickets FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own tickets"
ON public.support_tickets FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own tickets"
ON public.support_tickets FOR UPDATE
TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

-- Trigger to create profile when auth.users is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, balance)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/bottts/svg?seed=' || NEW.id),
    250000
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed Server Plans
INSERT INTO public.server_plans (slug, name, game_type, category, badge, vcpu, ram_gb, ssd_gb, bandwidth_tb, price_hourly, price_monthly, icon, description, features)
VALUES 
(
  'minecraft-paper',
  'Minecraft: Paper / Purpur',
  'minecraft',
  'Game Server',
  'POPULAR',
  4,
  8,
  60,
  2.5,
  120,
  75000,
  'simple-icons:minecraft',
  'Ultra low-latency PaperMC server with automated daily backups, free DDoS protection, and one-click plugin installer.',
  ARRAY['Unlimited Slots', 'NVMe Gen4 Storage', 'Daily Backups', 'One-Click Plugins', 'BungeeCord & Geyser Support', 'Singapore & Jakarta Node']
),
(
  'minecraft-extreme',
  'Minecraft: Heavy Modded',
  'minecraft',
  'Game Server',
  'BEAST MODE',
  8,
  16,
  120,
  5.0,
  240,
  145000,
  'simple-icons:minecraft',
  'Optimized for huge modpacks like All the Mods 9, DawnCraft, and Pixelmon with dedicated Ryzen 9 threads.',
  ARRAY['Ryzen 9 7950X cores', '16GB DDR5 RAM', 'Zero Tick-Drop Guarantee', 'CurseForge & Modrinth Sync', 'Dedicated IP:25565']
),
(
  'palworld-dedicated',
  'Palworld Dedicated Guild',
  'palworld',
  'Game Server',
  'HOT',
  6,
  16,
  100,
  4.0,
  220,
  135000,
  'lucide:swords',
  'High-RAM architecture tailored for Palworld memory leak mitigation and automatic RAM defragmentation.',
  ARRAY['32 Player Capacity', 'Auto-Memory Purge Script', 'DDoS L7 Shield', 'Custom Config Editor', 'Instant Reboot']
),
(
  'cs2-competitive',
  'Counter-Strike 2 (128 Tick)',
  'cs2',
  'Game Server',
  'LOW PING',
  4,
  8,
  50,
  3.0,
  130,
  85000,
  'lucide:crosshair',
  'Pure compute performance for tournament and community servers. Direct peering with Telkom, Indosat, Biznet, and SGIX.',
  ARRAY['<15ms Latency in SEA', 'SourceMod & Metamod Support', 'Workshop Maps FastDL', 'RCON Web Console']
),
(
  'rust-highpop',
  'Rust High-Pop Wipe Ready',
  'rust',
  'Game Server',
  'HARDCORE',
  6,
  16,
  90,
  5.0,
  250,
  150000,
  'lucide:shield-alert',
  'Built for large maps (4000+ size) with oxide/uMod ready setup, wipe scheduling, and fast wipe restarts.',
  ARRAY['Oxide / Carbon Support', 'Automated Wipe Scheduler', 'Raid-Proof Network Route', 'Rust+ App Integration']
),
(
  'valheim-viking',
  'Valheim Dedicated World',
  'valheim',
  'Game Server',
  'CO-OP FAVORITE',
  3,
  6,
  40,
  2.0,
  95,
  60000,
  'lucide:flame',
  'Explore the tenth world with zero desync. Crossplay enabled between Steam and Xbox players out of the box.',
  ARRAY['Crossplay Enabled', 'Valheim Plus Compatible', 'Cloud World Sync', '10-Player Seamless Co-Op']
),
(
  'cloud-vps-pro',
  'TLS Cloud Node (Linux VPS)',
  'vps',
  'Cloud VPS',
  'ROOT ACCESS',
  4,
  8,
  80,
  5.0,
  150,
  95000,
  'lucide:server',
  'Full Root / SSH access Ubuntu 24.04 / Debian 12 / Docker VPS with dedicated IPv4 and /64 IPv6 subnet.',
  ARRAY['Full Root / KVM Virtualization', 'Dedicated Public IPv4', 'Docker & Portainer Ready', 'Reverse DNS (rDNS)', 'BGP Anycast Routing']
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  game_type = EXCLUDED.game_type,
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  vcpu = EXCLUDED.vcpu,
  ram_gb = EXCLUDED.ram_gb,
  ssd_gb = EXCLUDED.ssd_gb,
  bandwidth_tb = EXCLUDED.bandwidth_tb,
  price_hourly = EXCLUDED.price_hourly,
  price_monthly = EXCLUDED.price_monthly,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  features = EXCLUDED.features;
`;

async function run() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Supabase Postgres...');
    await client.connect();
    console.log('Connected! Executing schema setup...');
    await client.query(schemaSql);
    console.log('Schema executed successfully!');

    const res = await client.query('SELECT count(*) FROM public.server_plans;');
    console.log('Total server plans loaded:', res.rows[0].count);
  } catch (err) {
    console.error('Error executing schema:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
