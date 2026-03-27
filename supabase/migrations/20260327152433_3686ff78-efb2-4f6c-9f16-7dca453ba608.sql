
-- Add missing columns to leads
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS street TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS place_id TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_content TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS referrer TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add missing column to market_snapshots
ALTER TABLE public.market_snapshots ADD COLUMN IF NOT EXISTS active_listings INTEGER DEFAULT 0;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_agents_zip_codes ON public.agents USING GIN(zip_codes);
CREATE INDEX IF NOT EXISTS idx_agents_active ON public.agents(active);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON public.leads(stage_reached);
CREATE INDEX IF NOT EXISTS idx_leads_agent ON public.leads(agent_id);
CREATE INDEX IF NOT EXISTS idx_leads_zip ON public.leads(zip);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach triggers
DROP TRIGGER IF EXISTS leads_updated_at ON public.leads;
CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS agents_updated_at ON public.agents;
CREATE TRIGGER agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS: Authenticated users full access (for admin)
CREATE POLICY "Admins full access to leads" ON public.leads FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access to agents" ON public.agents FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access to market_snapshots" ON public.market_snapshots FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access to property_snapshots" ON public.property_snapshots FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Restrict anon agent reads to active only (drop old, create new)
DROP POLICY IF EXISTS "Agents are publicly readable" ON public.agents;
CREATE POLICY "Public can read active agents" ON public.agents FOR SELECT TO anon USING (active = true);
