
-- Agents table
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Property Specialist',
  photo_url TEXT DEFAULT '',
  specialization TEXT DEFAULT 'Residential Sales',
  rating NUMERIC(2,1) NOT NULL DEFAULT 4.9,
  deals_closed INTEGER NOT NULL DEFAULT 0,
  bio TEXT DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  zip_codes TEXT[] NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Leads table
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT NOT NULL,
  city TEXT DEFAULT '',
  state TEXT DEFAULT '',
  zip TEXT DEFAULT '',
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  motivation TEXT,
  timeline TEXT,
  condition TEXT,
  stage_reached INTEGER NOT NULL DEFAULT 1,
  stage_completed INTEGER NOT NULL DEFAULT 0,
  agent_id UUID REFERENCES public.agents(id),
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Market snapshots table
CREATE TABLE public.market_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zip TEXT NOT NULL,
  median_price NUMERIC NOT NULL DEFAULT 0,
  price_per_sqft NUMERIC NOT NULL DEFAULT 0,
  days_on_market INTEGER NOT NULL DEFAULT 14,
  absorption_rate NUMERIC NOT NULL DEFAULT 0.5,
  trend TEXT NOT NULL DEFAULT 'stable',
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Property snapshots table
CREATE TABLE public.property_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT NOT NULL,
  zip TEXT NOT NULL DEFAULT '',
  beds INTEGER NOT NULL DEFAULT 0,
  baths INTEGER NOT NULL DEFAULT 0,
  sqft INTEGER NOT NULL DEFAULT 0,
  year_built INTEGER NOT NULL DEFAULT 0,
  estimated_value NUMERIC NOT NULL DEFAULT 0,
  arv NUMERIC NOT NULL DEFAULT 0,
  source TEXT DEFAULT '',
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_snapshots ENABLE ROW LEVEL SECURITY;

-- Agents: publicly readable (needed for funnel)
CREATE POLICY "Agents are publicly readable" ON public.agents FOR SELECT USING (true);

-- Leads: insert allowed for anonymous users (funnel submissions), no select for anon
CREATE POLICY "Anyone can insert leads" ON public.leads FOR INSERT WITH CHECK (true);

-- Market snapshots: publicly readable
CREATE POLICY "Market snapshots are publicly readable" ON public.market_snapshots FOR SELECT USING (true);

-- Property snapshots: publicly readable
CREATE POLICY "Property snapshots are publicly readable" ON public.property_snapshots FOR SELECT USING (true);
