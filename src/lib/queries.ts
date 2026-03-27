import { supabase } from '@/integrations/supabase/client';
import type { Agent, Motivation, Timeline, Condition } from '@/lib/types';

const DEFAULT_MARKET_DATA = {
  median_price: 385000,
  price_per_sqft: 218,
  days_on_market: 14,
  absorption_rate: 0.72,
  trend: 'stable' as const,
  active_listings: 142,
};

export async function fetchAgentByZip(zip: string): Promise<Agent | null> {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .contains('zip_codes', [zip])
    .eq('active', true)
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    // Fallback: get any active agent
    const { data: fallback } = await supabase
      .from('agents')
      .select('*')
      .eq('active', true)
      .limit(1)
      .maybeSingle();

    return fallback as Agent | null;
  }

  return data as Agent;
}

export async function fetchMarketByZip(zip: string) {
  const { data } = await supabase
    .from('market_snapshots')
    .select('*')
    .eq('zip', zip)
    .maybeSingle();

  return data ?? DEFAULT_MARKET_DATA;
}

export async function submitLead(params: {
  address: string;
  city: string;
  state: string;
  zip: string;
  motivation: Motivation | null;
  timeline: Timeline | null;
  condition: Condition | null;
  name: string;
  email: string;
  phone: string;
  agentId: string | null;
}): Promise<void> {
  const { error } = await supabase
    .from('leads')
    .insert({
      address: params.address,
      city: params.city,
      state: params.state,
      zip: params.zip,
      motivation: params.motivation,
      timeline: params.timeline,
      condition: params.condition,
      name: params.name,
      email: params.email,
      phone: params.phone,
      agent_id: params.agentId,
      stage_reached: 7,
      stage_completed: 7,
      status: 'new',
    });

  if (error) throw error;
}
